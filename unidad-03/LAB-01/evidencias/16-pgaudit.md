# Actividad 19 — Auditoría de objeto sobre columnas sensibles

1. ¿Por qué no apareció SELECT nombre, ciudad ...? ¿Por qué sí apareció SELECT * ...?

* SELECT nombre, ciudad ...: No apareció porque ninguna de esas dos columnas forma parte de los permisos asignados al rol auditor_datos (que solo monitorea rfc y telefono).

* SELECT * ...: Sí apareció porque el uso del asterisco solicita todas las columnas de la tabla, lo que incluye obligatoriamente a rfc y telefono, activando de inmediato el registro de pgaudit.

2. ¿Por qué no apareció UPDATE ... ciudad ...?

Porque la instrucción solo modificó la columna ciudad. Como al rol auditor_datos únicamente se le otorgaron permisos sobre rfc y telefono, pgaudit ignora cualquier actualización realizada sobre columnas que no estén definidas como sensibles.

3. ¿Qué diferencia de volumen esperarías frente a log_statement = 'all'?

El volumen de información generada es drásticamente menor. Mientras que log_statement = 'all' guarda absolutamente todas las consultas de todas las tablas en el servidor (llenando el disco rápidamente), pgaudit en modo objeto solo genera registros cuando se consulta o modifica específicamente la información sensible delimitada.

4. El README oficial advierte que pgaudit no puede auditar de forma confiable a los superusuarios. ¿Qué implica para la separación de funciones?

Implica que la propia base de datos no puede garantizar la supervisión de la cuenta principal (postgres), ya que un superusuario tiene la capacidad de ignorar filtros o modificar las reglas del sistema. Para mantener una separación de funciones real, la operación diaria debe realizarse con usuarios de menor privilegio y los registros de actividad de los superusuarios deben exportarse en tiempo real a un sistema externo de seguridad (SIEM) fuera del alcance de los administradores del motor.