ALTER SYSTEM SET logging_collector = on;
SELECT name, setting, pending_restart FROM pg_settings WHERE name = 'logging_collector';

SELECT name, setting, source FROM pg_settings WHERE name = 'logging_collector';
SELECT pg_current_logfile();

CREATE SCHEMA dba;
REVOKE ALL ON SCHEMA dba FROM PUBLIC;

CREATE VIEW dba.bitacora AS
SELECT t.n AS num, 
       t.linea
FROM regexp_split_to_table(
       convert_from(pg_read_binary_file(pg_current_logfile()), 'WIN1252'), 
       E'\n'
     ) WITH ORDINALITY AS t(linea, n)
WHERE t.linea <> '';

SELECT num, linea FROM dba.bitacora ORDER BY num DESC LIMIT 10;

SELECT linea FROM dba.bitacora WHERE linea ILIKE '%update%';

SELECT linea FROM dba.bitacora WHERE linea ~ '(FATAL|ERROR)';