# Actividad 15 — Límites: lecturas y volumen

1. Si clientes tuviera un millón de registros, ¿qué ocurriría con la auditoría tras un UPDATE sin WHERE?

Se insertarían un millón de filas individuales en la tabla auditoria.cambios_clientes, ya que el disparador se ejecuta una vez por cada registro afectado (FOR EACH ROW). Esto provocaría un consumo masivo e inmediato de espacio en disco, volvería extremadamente lenta la transacción (pudiendo bloquear la tabla por un largo periodo) y corriese el riesgo de dejar al servidor sin almacenamiento disponible.

2. Propón quién podría autorizar la depuración de auditoria.cambios_clientes.

La autorización debe provenir de forma conjunta del Oficial de Protección de Datos (DPO), la Dirección Legal y el Comité de Auditoría/Seguridad de la Información. Bajo ninguna circunstancia el administrador de la base de datos (DBA) ni el equipo de desarrollo deben tomar la decisión o ejecutar la eliminación de estos registros de manera unilateral.

3. ¿Por qué log_statement = 'all' puede convertir la bitácora en un nuevo depósito de datos sensibles?

Porque este ajuste registra la totalidad de las sentencias ejecutadas, incluyendo las consultas de lectura (SELECT). Si una aplicación o un usuario busca clientes filtrando por RFC, números de tarjeta, direcciones o contraseñas, todo ese texto plano con información privada queda almacenado en los archivos de texto de la bitácora en el servidor.