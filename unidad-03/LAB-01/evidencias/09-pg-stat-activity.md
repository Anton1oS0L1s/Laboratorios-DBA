# Actividad 9 — Sesiones activas con pg_stat_activity

1. ¿Qué columna permite relacionar una sesión con sus líneas de bitácora?

La columna pid (el número de proceso del backend). Este mismo identificador aparece grabado entre corchetes (gracias al marcador %p del prefijo) en cada renglón de la bitácora física, lo que facilita cruzar lo que pasa en memoria con lo guardado en el archivo.   

2. Después de que termina el reporte, ¿qué fuente conserva evidencia de que existió?

La bitácora física del servidor (dba.bitacora / archivos .log). La vista pg_stat_activity solo muestra lo que está pasando en vivo y borra la información de la sesión en cuanto esta termina, mientras que el archivo de registro guarda el historial permanente con la hora de inicio, la desconexión y la duración.   

3. ¿Por qué client_addr aparece vacío en la sesión del administrador?

Porque la sesión del administrador se abrió directamente en la propia computadora donde corre el servidor mediante un conector interno del sistema (socket de UNIX), por lo que no usó la red de internet ni requirió una dirección IP de origen.