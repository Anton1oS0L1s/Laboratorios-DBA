# Actividad 3 - Incidente sin bitácora

1. ¿Puedes demostrar quién modificó el RFC?

No. Como los parámetros de registro (log_statement en mod o all, y log_connections) estaban desactivados, el motor no dejó ningún rastro de la sentencia UPDATE ejecutada ni de la sesión que se conectó.

2. ¿Puedes demostrar que el cambio no lo hizo soporte_ana?

No se puede probar. Aunque soporte_ana solo tiene permiso de lectura (SELECT) y el motor le habría rechazado un UPDATE directo, sin bitácora no hay forma de comprobar si alguien usó la cuenta de app_ventas para hacer el cambio o si se trató de otro usuario.

3. Los privilegios de la Unidad II, ¿impidieron el cambio? ¿Debían impedirlo?

No lo impidieron: El rol app_ventas tenía permiso explícito para hacer UPDATE en la tabla clientes, por lo que la base de datos procesó la consulta sin problemas.
No debían impedirlo: El control de acceso (Unidad II) define lo que cada rol puede hacer en su trabajo diario. La auditoría (Unidad III) no busca bloquear acciones permitidas, sino registrar quién hizo el cambio, cuándo, desde dónde y qué modificó para tener evidencia clara de lo que pasó.

4. ¿Qué tendría que haber estado configurado antes del incidente?

logging_collector = on: Para guardar los archivos de bitácora en el servidor.
log_connections = on y log_disconnections = on: Para registrar los inicios y fines de sesión.
log_line_prefix: Ajustado con %m [%p] %u@%d %h %a para guardar usuario, base de datos, IP y nombre de la aplicación.
log_statement = 'mod' (o 'all'): Para registrar sentencias de modificación (INSERT, UPDATE, DELETE).

4. Auditoría a nivel de dato: Un disparador (trigger) y una tabla de auditoría para guardar el valor anterior (GAMA780912GHI) y el valor nuevo (GAMA780912XXX).