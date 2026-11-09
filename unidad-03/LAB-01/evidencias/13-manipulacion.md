# Actividad 14 — Intentar manipular la auditoría

1. ¿Qué evidencia permite detectar que hubo un cambio sin auditar?

 La bitácora física del servidor (dba.bitacora). Aunque en la tabla auditoria.cambios_clientes no quedó registrado el UPDATE, en los registros del servidor quedaron grabados los comandos DISABLE TRIGGER, el UPDATE realizado y la posterior reactivación con ENABLE TRIGGER. Cruzar las sentencias registradas en la bitácora del motor con los eventos de la tabla de auditoría permite identificar la brecha de tiempo en la que el mecanismo estuvo desactivado.

2. ¿Qué control administrativo (no técnico) reduciría este riesgo?

Establecer una política de supervisión y gestión de cuentas privilegiadas que exija autorización y registro previo para el uso de la cuenta postgres, junto con la exportación en tiempo real de las bitácoras a un servidor centralizado e inmutable administrado de forma independiente por el equipo de seguridad de la información.

3. Relaciona esta actividad con el principio de separación de funciones de la Unidad II.

El principio de separación de funciones establece que la persona encargada de operar la base de datos no debe ser la misma que audita o custodia las evidencias de seguridad. Si el DBA cuenta con superprivilegios para desactivar disparadores y modificar registros, existe el riesgo de impunidad; separar la administración de la infraestructura de la custodia de los registros garantiza que ningún usuario pueda alterar datos y borrar su propio rastro de forma simultánea.