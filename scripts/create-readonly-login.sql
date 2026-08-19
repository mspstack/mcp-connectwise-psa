/*
  Create the read-only SQL Server login the `sql` toolset connects with.

  This login IS the security boundary. The MCP server sends the model's SQL to
  SQL Server unparsed, so what this login is allowed to do is exactly what can
  happen. It gets SELECT on one database and nothing else, and the columns that
  hold credentials are denied outright.

  Run as sysadmin (or a login with ALTER ANY LOGIN + db_owner on the target
  database), against the instance hosting ConnectWise Manage:

    sqlcmd -S SQLHOST\CWPROD -d master -i scripts/create-readonly-login.sql

  Edit the four variables below first. @WhatIf defaults to 1: nothing is changed
  until you set it to 0 — read the printed plan first, this is a production PSA
  database.

  Re-running is safe: every step is guarded, so it doubles as a way to re-apply
  the DENYs after a ConnectWise upgrade adds tables.

  Afterwards, verify with scripts/verify-readonly-login.sql, run AS THIS LOGIN.
*/

SET NOCOUNT ON;

------------------------------------------------------------------------------
-- Settings
------------------------------------------------------------------------------
DECLARE @LoginName  sysname        = N'cw_mcp_ro';
DECLARE @Password   nvarchar(128)  = N'';                    -- 32+ random characters
DECLARE @Database   sysname        = N'cwwebapp_yourcompany';
DECLARE @WhatIf     bit            = 1;                      -- 0 to actually apply
DECLARE @ResetPassword bit         = 0;                      -- 1 to reset an existing login's password

------------------------------------------------------------------------------
-- Guards
------------------------------------------------------------------------------
IF @Password = N'' AND @WhatIf = 0
    AND (@ResetPassword = 1 OR NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @LoginName))
BEGIN
    RAISERROR(N'Set @Password to a 32+ character random password before applying.', 16, 1);
    RETURN;
END

IF DB_ID(@Database) IS NULL
BEGIN
    RAISERROR(N'Database %s does not exist on this instance.', 16, 1, @Database);
    RETURN;
END

DECLARE @qLogin nvarchar(300) = QUOTENAME(@LoginName);
DECLARE @qDb    nvarchar(300) = QUOTENAME(@Database);
DECLARE @sql    nvarchar(max);
DECLARE @exec   nvarchar(400) = @qDb + N'.sys.sp_executesql';  -- runs in the DB context
DECLARE @applied int = 0;

PRINT N'--- ' + CASE WHEN @WhatIf = 1 THEN N'PREVIEW (nothing will change)' ELSE N'APPLYING' END
    + N' | login ' + @LoginName + N' | database ' + @Database + N' ---';
PRINT N'';

------------------------------------------------------------------------------
-- 1. The login itself. No server role, no server-level permissions.
------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @LoginName)
BEGIN
    SET @sql = N'CREATE LOGIN ' + @qLogin + N' WITH PASSWORD = ' + QUOTENAME(@Password, '''')
             + N', DEFAULT_DATABASE = ' + @qDb + N', CHECK_POLICY = ON;';
    PRINT N'1. CREATE LOGIN ' + @qLogin + N' (password hidden)';
    IF @WhatIf = 0 BEGIN EXEC sys.sp_executesql @sql; SET @applied += 1; END
END
ELSE IF @ResetPassword = 1
BEGIN
    SET @sql = N'ALTER LOGIN ' + @qLogin + N' WITH PASSWORD = ' + QUOTENAME(@Password, '''') + N';';
    PRINT N'1. ALTER LOGIN ' + @qLogin + N' — resetting the password (hidden)';
    IF @WhatIf = 0 BEGIN EXEC sys.sp_executesql @sql; SET @applied += 1; END
END
ELSE
    PRINT N'1. login already exists — password left alone (set @ResetPassword = 1 to change it)';

------------------------------------------------------------------------------
-- 2. A database user, read-only. db_datareader is SELECT on every table and
--    view; the login is deliberately given nothing else.
------------------------------------------------------------------------------
-- EXEC(…) takes only literals and variables — a QUOTENAME() call inside it is a
-- syntax error — so each statement is built into a variable first.
SET @sql = N'
DECLARE @stmt nvarchar(400);
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @LoginName)
BEGIN
    SET @stmt = N''CREATE USER '' + QUOTENAME(@LoginName) + N'' FOR LOGIN '' + QUOTENAME(@LoginName) + N'';'';
    EXEC sys.sp_executesql @stmt;
END
IF IS_ROLEMEMBER(''db_datareader'', @LoginName) = 0
BEGIN
    SET @stmt = N''ALTER ROLE db_datareader ADD MEMBER '' + QUOTENAME(@LoginName) + N'';'';
    EXEC sys.sp_executesql @stmt;
END';
PRINT N'2. CREATE USER + ALTER ROLE db_datareader ADD MEMBER ' + @qLogin;
IF @WhatIf = 0
BEGIN
    -- Positional, not named: EXEC through a variable proc name binds named
    -- parameters unreliably.
    EXEC @exec @sql, N'@LoginName sysname', @LoginName;
    SET @applied += 1;

    -- Everything below grants to this user. If it is not there, stop rather than
    -- emit one "Cannot find the user" per DENY.
    --
    -- Read it back through a three-part name with the local sp_executesql:
    -- EXEC @variable binds named parameters unreliably, so an OUTPUT taken that
    -- way can come back empty even when the user exists.
    DECLARE @userExists int;
    SET @sql = N'SELECT @found = COUNT(*) FROM ' + @qDb
             + N'.sys.database_principals WHERE name = @Login;';
    EXEC sys.sp_executesql @sql, N'@Login sysname, @found int OUTPUT',
         @Login = @LoginName, @found = @userExists OUTPUT;

    IF ISNULL(@userExists, 0) = 0
    BEGIN
        RAISERROR(N'Cannot see the database user %s in %s — stopping before the DENY steps. Check it with: SELECT name FROM %s.sys.database_principals WHERE name = ''%s'';',
                  16, 1, @LoginName, @Database, @Database, @LoginName);
        RETURN;
    END

    PRINT N'   user confirmed in ' + @Database;
END

------------------------------------------------------------------------------
-- 3. DENY everything else. A DENY beats a later accidental GRANT or role
--    membership, which is the point: this survives someone "helpfully" adding
--    the login to a role during an upgrade.
--
--    EXECUTE is the one that matters most. With it, "read-only SQL" becomes
--    remote code execution as the SQL Server service account via xp_cmdshell,
--    sp_OACreate or sp_send_dbmail.
------------------------------------------------------------------------------
SET @sql = N'
DENY EXECUTE TO ' + @qLogin + N';
DENY INSERT, UPDATE, DELETE, ALTER, REFERENCES TO ' + @qLogin + N';
DENY CREATE TABLE, CREATE VIEW, CREATE PROCEDURE, CREATE FUNCTION, CREATE SCHEMA TO ' + @qLogin + N';
DENY BACKUP DATABASE, BACKUP LOG TO ' + @qLogin + N';';
PRINT N'3. DENY EXECUTE / INSERT / UPDATE / DELETE / ALTER / REFERENCES / CREATE * / BACKUP *';
IF @WhatIf = 0 BEGIN EXEC @exec @sql; SET @applied += 1; END

------------------------------------------------------------------------------
-- 4. DENY the credential columns, discovered rather than hard-coded: the names
--    move between ConnectWise versions, and every MSP adds its own.
--
--    Consequence worth knowing: SELECT * on a table with a denied column fails
--    outright instead of returning the other columns. That is intended, and the
--    tool's error text tells the model to name its columns.
------------------------------------------------------------------------------
DECLARE @denies TABLE (object_full nvarchar(300), column_name sysname, statement nvarchar(700));

SET @sql = N'
SELECT QUOTENAME(s.name) + N''.'' + QUOTENAME(o.name), c.name
FROM sys.columns c
JOIN sys.objects o ON o.object_id = c.object_id
JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE o.type IN (''U'', ''V'')
  AND (  c.name LIKE ''%password%''   OR c.name LIKE ''%passwd%''
      OR c.name LIKE ''%pwd%''        OR c.name LIKE ''%hash%''
      OR c.name LIKE ''%salt%''       OR c.name LIKE ''%token%''
      OR c.name LIKE ''%secret%''     OR c.name LIKE ''%privatekey%''
      OR c.name LIKE ''%private_key%''OR c.name LIKE ''%apikey%''
      OR c.name LIKE ''%api_key%''    OR c.name LIKE ''%credential%''
      OR c.name LIKE ''%ssn%''        OR c.name LIKE ''%socialsecurity%''
      OR c.name LIKE ''%creditcard%'' OR c.name LIKE ''%cardnum%''
      OR c.name LIKE ''%cvv%''        OR c.name LIKE ''%routingnumber%''
      OR c.name LIKE ''%accountnumber%'')
ORDER BY s.name, o.name, c.name;';

INSERT INTO @denies (object_full, column_name)
EXEC @exec @sql;

UPDATE @denies
   SET statement = N'DENY SELECT ON ' + object_full + N'(' + QUOTENAME(column_name)
                 + N') TO ' + @qLogin + N';';

DECLARE @denyCount int = (SELECT COUNT(*) FROM @denies);
PRINT N'4. DENY SELECT on ' + CAST(@denyCount AS nvarchar(10)) + N' credential column(s):';

DECLARE @batch nvarchar(max) = N'';
SELECT @batch = @batch + statement + NCHAR(10) FROM @denies;

DECLARE @line nvarchar(600);
DECLARE deny_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT N'     ' + object_full + N'.' + column_name FROM @denies ORDER BY object_full, column_name;
OPEN deny_cursor;
FETCH NEXT FROM deny_cursor INTO @line;
WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT @line;
    FETCH NEXT FROM deny_cursor INTO @line;
END
CLOSE deny_cursor;
DEALLOCATE deny_cursor;

IF @denyCount = 0
    PRINT N'     (none matched — check the patterns above against this schema before trusting that)';

IF @WhatIf = 0 AND @denyCount > 0
BEGIN
    -- Column names come from sys.columns and are QUOTENAME''d above.
    EXEC @exec @batch;
    SET @applied += 1;
END

------------------------------------------------------------------------------
-- 5. Report the server-level settings that must be off. These are instance-wide
--    and this script does NOT change them — turning off xp_cmdshell can break
--    other applications, so it is a decision, not a side effect.
------------------------------------------------------------------------------
PRINT N'';
PRINT N'5. Server settings that must be 0 for this login to be safe:';

SELECT
    name,
    CAST(value_in_use AS int)                                    AS run_value,
    CASE WHEN CAST(value_in_use AS int) = 0 THEN 'ok' ELSE 'MUST BE DISABLED' END AS verdict
FROM sys.configurations
WHERE name IN ('xp_cmdshell', 'Ole Automation Procedures', 'Ad Hoc Distributed Queries', 'Database Mail XPs')
ORDER BY name;

SELECT
    @LoginName                                        AS login_name,
    IS_SRVROLEMEMBER('sysadmin', @LoginName)          AS is_sysadmin,      -- must be 0
    IS_SRVROLEMEMBER('securityadmin', @LoginName)     AS is_securityadmin, -- must be 0
    IS_SRVROLEMEMBER('serveradmin', @LoginName)       AS is_serveradmin;   -- must be 0

PRINT N'';
IF @WhatIf = 1
    PRINT N'PREVIEW ONLY — nothing was changed. Set @WhatIf = 0 to apply.';
ELSE
    PRINT N'Applied ' + CAST(@applied AS nvarchar(10)) + N' step(s).';

PRINT N'';
PRINT N'Next:';
PRINT N'  1. Verify AS THIS LOGIN:  sqlcmd -S <host> -d <db> -U ' + @LoginName
    + N' -P <password> -i scripts/verify-readonly-login.sql';
PRINT N'  2. Configure the server:  CW_DB_HOST, CW_DB_NAME, CW_DB_USER='  + @LoginName
    + N', CW_DB_PASSWORD, and CW_TOOLSETS=all,sql';
PRINT N'  3. Keep the password in a secret store — it is a server-wide credential,';
PRINT N'     not a per-member one, so anything with the sql toolset reads the whole PSA.';
