# Actividad 11 — Crear la función y el disparador

1. ¿Por qué se ejecuta REVOKE ALL ON FUNCTION ... FROM PUBLIC si el disparador seguirá funcionando para app_ventas?

Porque los disparadores se ejecutan de forma automática ante un evento en la tabla clientes, pero si la función mantiene permisos para PUBLIC, cualquier usuario podría ejecutarla directamente desde una consulta SELECT e inyectar registros falsos en la auditoría. Al quitarle los privilegios a PUBLIC, se impide su ejecución directa por SQL sin afectar el funcionamiento del disparador.

2. ¿Qué pasaría si la función no fuera SECURITY DEFINER? Formula una hipótesis antes de la Actividad 12.

Se ejecutaría con los permisos del usuario que realiza la acción (por ejemplo, app_ventas). Como app_ventas no tiene permisos para insertar en la tabla auditoria.cambios_clientes, cualquier intento de modificar o insertar datos en clientes fallaría con un error de permisos denegados.

3. Consulta dba.bitacora. ¿Quedó registrada la creación del esquema, la tabla, la función y el disparador? ¿Por qué?

Sí, quedaron registrados todos los eventos. Ocurre porque log_statement está configurado para registrar sentencias de tipo ddl, y comandos como CREATE SCHEMA, CREATE TABLE, CREATE FUNCTION y CREATE TRIGGER pertenecen a esa categoría de definición de estructura.

# Actividad 12 — El incidente auditado

1. Compara tu hipótesis de la Actividad 11 con este resultado.

La hipótesis se confirma: al usar SECURITY DEFINER, la función se ejecuta internamente con los permisos del dueño (postgres), lo que permite guardar el registro de auditoría sin necesidad de darle permisos de escritura a app_ventas. Asimismo, cuando app_ventas intenta leer directamente la tabla de auditoría, el motor le deniega el acceso por no tener permisos sobre el esquema, demostrando el aislamiento de la información.

2. Escribe la sentencia UPDATE que restauraría el valor anterior.
```SQL
UPDATE clientes SET rfc = 'GAMA780912XYZ' WHERE id = 3;
```
3. ¿Qué columna conserva más valor para una investigación: aplicacion o ip_cliente? ¿Cuál puede falsificar el cliente con más facilidad?

La columna ip_cliente conserva más valor para una investigación porque representa el origen físico o lógico de la conexión capturado directamente por la capa de red del servidor. La columna aplicacion (application_name) es la que se falsifica con mayor facilidad, pues el cliente puede escribir cualquier texto en el parámetro de conexión para hacerse pasar por otro sistema.