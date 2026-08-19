-- Dump the ConnectWise Manage schema for scripts/gen-db-schema.mjs.
--
-- Metadata only: sys.partitions is read for nothing but existence, and no user
-- table is scanned, so this is safe to run against a production instance.
--
-- Run it with sqlcmd rather than SSMS — SSMS truncates FOR JSON output at 2,033
-- characters per row, which silently corrupts the result:
--
--   sqlcmd -S SQLHOST\CWPROD -d cwwebapp_acme -U cwreader -P '…' -y 0 -h -1 -W \
--     -i scripts/dump-db-schema.sql -o .claude/cw-db-schema.json
--
-- Then: node scripts/gen-db-schema.mjs .claude/cw-db-schema.json
--
-- .claude/ is gitignored. The generator emits only the tables named in its
-- ENRICH map, and never emits row counts, custom/UDF tables, credential
-- columns, or anything identifying the source instance.

SET NOCOUNT ON;

SELECT
  (SELECT s.name AS [schema], t.name AS [name]
     FROM sys.tables t
     JOIN sys.schemas s ON s.schema_id = t.schema_id
    FOR JSON PATH) AS [tables],

  (SELECT c.TABLE_SCHEMA AS [schema], c.TABLE_NAME AS [table], c.COLUMN_NAME AS [column],
          c.DATA_TYPE AS [type], c.CHARACTER_MAXIMUM_LENGTH AS [len],
          c.IS_NULLABLE AS [nullable], c.ORDINAL_POSITION AS [ord]
     FROM INFORMATION_SCHEMA.COLUMNS c
     JOIN INFORMATION_SCHEMA.TABLES t
       ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
      AND t.TABLE_NAME = c.TABLE_NAME
      AND t.TABLE_TYPE = 'BASE TABLE'
    FOR JSON PATH) AS [columns],

  (SELECT tc.TABLE_SCHEMA AS [schema], tc.TABLE_NAME AS [table],
          kcu.COLUMN_NAME AS [column], kcu.ORDINAL_POSITION AS [ord]
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
     JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
      AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
    WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    FOR JSON PATH) AS [primaryKeys],

  -- ConnectWise declares few real foreign keys; expect this to be nearly empty
  -- and rely on the X_RecID naming convention instead.
  (SELECT OBJECT_SCHEMA_NAME(fk.parent_object_id) AS [schema],
          OBJECT_NAME(fk.parent_object_id)        AS [table],
          pc.name                                 AS [column],
          OBJECT_NAME(fk.referenced_object_id)    AS [refTable],
          rc.name                                 AS [refColumn]
     FROM sys.foreign_keys fk
     JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
     JOIN sys.columns pc ON pc.object_id = fkc.parent_object_id     AND pc.column_id = fkc.parent_column_id
     JOIN sys.columns rc ON rc.object_id = fkc.referenced_object_id AND rc.column_id = fkc.referenced_column_id
    FOR JSON PATH) AS [foreignKeys]
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
