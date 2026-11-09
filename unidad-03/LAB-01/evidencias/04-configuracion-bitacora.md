# Actividad 4 — Configurar la bitácora

1. ¿Por qué el proceso que registra el cambio es el principal y no tu sesión?

Porque al ejecutar SELECT pg_reload_conf(), mi sesión solo le avisa al proceso principal de PostgreSQL que vuelva a leer los archivos de configuración. El proceso principal del servidor es el que realmente aplica los cambios de los parámetros y por eso aparece su PID en el log.

2. ¿Qué pasaría si alguien ejecutara ALTER SYSTEM SET log_statement = 'none'? ¿Quedaría rastro?

Sí, sí queda rastro.
Aunque después de esa orden la bitácora deje de guardar los comandos, el momento exacto en que se recarga la configuración sí queda escrito en el log con un mensaje de aviso que dice: LOG: parameter "log_statement" changed to "none".

3. ¿Por qué no se recomienda editar postgresql.auto.conf a mano?
Porque es un archivo que PostgreSQL controla de forma automática. Si lo edito a mano, cualquier comando ALTER SYSTEM futuro puede borrar o sobreescribir mis cambios. Además, cometer un error al escribirlo puede hacer que la base de datos marque error al intentar recargar.