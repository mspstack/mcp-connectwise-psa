/*
  Verify the read-only login created by scripts/create-readonly-login.sql.

  Run it AS THAT LOGIN — running it as sysadmin proves nothing:

    sqlcmd -S SQLHOST\CWPROD -d cwwebapp_yourcompany -U cw_mcp_ro -P '<password>' \
      -i scripts/verify-readonly-login.sql

  Every check prints PASS or FAIL. One FAIL means the login can do more than the
  `sql` toolset should ever be able to do — fix it before enabling the toolset,
  because there is no statement validation in front of it.

  Nothing here modifies data: the write attempts run inside a transaction that is
  always rolled back, precisely in case a DENY is missing.

  Every probe runs through sys.sp_executesql rather than inline. Some permission
  failures — OPENROWSET(BULK) is the notorious one (Msg 4834) — are raised while
  the batch is being compiled, and a TRY/CATCH cannot catch those in its own
  batch: the whole script would abort instead of printing FAIL. Putting each
  probe in a child scope makes them catchable.
*/

SET NOCOUNT ON;
SET XACT_ABORT OFF;

PRINT N'--- verifying as ' + SUSER_SNAME() + N' on ' + DB_NAME() + N' ---';
PRINT N'';

DECLARE @fails int = 0;

------------------------------------------------------------------------------
-- 1. Reading must work, or the toolset is useless.
------------------------------------------------------------------------------
BEGIN TRY
    EXEC sys.sp_executesql N'SELECT TOP 1 1 AS probe FROM dbo.SR_Service;';
    PRINT N'PASS  SELECT on SR_Service works';
END TRY
BEGIN CATCH
    PRINT N'FAIL  SELECT on SR_Service was refused: ' + ERROR_MESSAGE();
    SET @fails += 1;
END CATCH

BEGIN TRY
    EXEC sys.sp_executesql N'SELECT TOP 1 1 AS probe FROM dbo.v_rpt_service;';
    PRINT N'PASS  SELECT on v_rpt_service works';
END TRY
BEGIN CATCH
    PRINT N'FAIL  SELECT on v_rpt_service was refused: ' + ERROR_MESSAGE();
    SET @fails += 1;
END CATCH

------------------------------------------------------------------------------
-- 2. Writing must not. Wrapped in a transaction that always rolls back, so a
--    missing DENY is reported rather than acted on.
------------------------------------------------------------------------------
BEGIN TRY
    BEGIN TRAN;
    EXEC sys.sp_executesql N'UPDATE TOP (1) dbo.SR_Service SET Summary = Summary;';
    PRINT N'FAIL  UPDATE on SR_Service SUCCEEDED — this login can write (rolled back)';
    SET @fails += 1;
    ROLLBACK;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    PRINT N'PASS  UPDATE refused';
END CATCH

BEGIN TRY
    BEGIN TRAN;
    EXEC sys.sp_executesql N'CREATE TABLE dbo.zz_mcp_write_probe (id int);';
    PRINT N'FAIL  CREATE TABLE SUCCEEDED — this login can change the schema (rolled back)';
    SET @fails += 1;
    ROLLBACK;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    PRINT N'PASS  CREATE TABLE refused';
END CATCH

------------------------------------------------------------------------------
-- 3. Nothing executable. This is the one that turns read-only SQL into remote
--    code execution if it is wrong.
------------------------------------------------------------------------------
BEGIN TRY
    EXEC sys.sp_executesql N'EXEC master.dbo.xp_cmdshell ''whoami'';';
    PRINT N'FAIL  xp_cmdshell RAN — this is remote code execution, stop and fix it';
    SET @fails += 1;
END TRY
BEGIN CATCH
    PRINT N'PASS  xp_cmdshell refused';
END CATCH

BEGIN TRY
    EXEC sys.sp_executesql N'DECLARE @ole int; EXEC master.dbo.sp_OACreate ''WScript.Shell'', @ole OUT;';
    PRINT N'FAIL  sp_OACreate RAN — OLE automation is reachable';
    SET @fails += 1;
END TRY
BEGIN CATCH
    PRINT N'PASS  sp_OACreate refused';
END CATCH

BEGIN TRY
    -- Needs no EXECUTE permission, so it is a separate hole from the two above.
    -- Msg 4834 is a compile-time error, hence the child scope.
    EXEC sys.sp_executesql
        N'SELECT TOP 1 1 AS probe FROM OPENROWSET(BULK N''C:\Windows\win.ini'', SINGLE_CLOB) AS f;';
    PRINT N'FAIL  OPENROWSET(BULK) READ A FILE — disable Ad Hoc Distributed Queries';
    SET @fails += 1;
END TRY
BEGIN CATCH
    PRINT N'PASS  OPENROWSET(BULK) refused';
END CATCH

------------------------------------------------------------------------------
-- 4. Credential columns must be unreadable. SELECT * failing on such a table is
--    the expected, desired behaviour.
------------------------------------------------------------------------------
DECLARE @secretTable sysname, @secretColumn sysname, @probe nvarchar(600);

SELECT TOP 1
       @secretTable  = QUOTENAME(s.name) + N'.' + QUOTENAME(o.name),
       @secretColumn = QUOTENAME(c.name)
FROM sys.columns c
JOIN sys.objects o ON o.object_id = c.object_id
JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE o.type = 'U'
  AND (c.name LIKE '%password%' OR c.name LIKE '%hash%' OR c.name LIKE '%token%'
    OR c.name LIKE '%secret%'   OR c.name LIKE '%apikey%' OR c.name LIKE '%api_key%')
ORDER BY o.name, c.name;

IF @secretColumn IS NULL
    PRINT N'SKIP  no credential-looking column found to probe (check the create script''s patterns)';
ELSE
BEGIN
    BEGIN TRY
        SET @probe = N'SELECT TOP 1 ' + @secretColumn + N' FROM ' + @secretTable + N';';
        EXEC sys.sp_executesql @probe;
        PRINT N'FAIL  read ' + @secretTable + N'.' + @secretColumn + N' — DENY the credential columns';
        SET @fails += 1;
    END TRY
    BEGIN CATCH
        PRINT N'PASS  ' + @secretTable + N'.' + @secretColumn + N' is denied';
    END CATCH

    -- The whole point of the column DENY: SELECT * must fail on that table.
    BEGIN TRY
        SET @probe = N'SELECT TOP 1 * FROM ' + @secretTable + N';';
        EXEC sys.sp_executesql @probe;
        PRINT N'WARN  SELECT * on ' + @secretTable + N' succeeded — the denied column is not on this table after all';
    END TRY
    BEGIN CATCH
        PRINT N'PASS  SELECT * on ' + @secretTable + N' is refused (name your columns instead)';
    END CATCH
END

------------------------------------------------------------------------------
-- 5. No elevated membership, and no reach outside this database.
------------------------------------------------------------------------------
IF IS_SRVROLEMEMBER('sysadmin') = 1
BEGIN
    PRINT N'FAIL  this login is sysadmin';
    SET @fails += 1;
END
ELSE
    PRINT N'PASS  not sysadmin';

IF IS_MEMBER('db_owner') = 1 OR IS_MEMBER('db_datawriter') = 1 OR IS_MEMBER('db_ddladmin') = 1
BEGIN
    PRINT N'FAIL  this login is in a writing database role';
    SET @fails += 1;
END
ELSE
    PRINT N'PASS  read-only database roles only';

------------------------------------------------------------------------------
PRINT N'';
IF @fails = 0
    PRINT N'ALL CHECKS PASSED — safe to enable CW_TOOLSETS=…,sql';
ELSE
    PRINT N'*** ' + CAST(@fails AS nvarchar(10)) + N' CHECK(S) FAILED — do not enable the sql toolset yet ***';
