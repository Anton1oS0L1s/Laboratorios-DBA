# Actividad 6 — Cambios de privilegios y de estructura

1. ¿Qué tipo de evento es cada una de las tres primeras sentencias (privilegio o estructura)?

* REVOKE UPDATE...: Evento de privilegio (modifica los derechos de acceso de un usuario).   
* GRANT UPDATE...: Evento de privilegio (asigna derechos de acceso a un usuario).   
* ALTER TABLE...: Evento de estructura (cambia la definición interna de la tabla agregándole una columna).   

2. ¿Por qué GRANT y REVOKE quedan registrados con log_statement = 'ddl'?

Porque en PostgreSQL, dar o quitar permisos modifica directamente los catálogos internos que definen los objetos de la base de datos. Al cambiar las reglas y derechos sobre una tabla, el motor interpreta que se está alterando la definición de la estructura del sistema, por lo que los incluye dentro de la categoría DDL.   

3. Si la bitácora contiene contraseñas, ¿quién debería poder leerla? Relaciónalo con la gestión de secretos de la Unidad II.

Solo el personal administrador de la base de datos y el equipo de seguridad. Las cuentas operativas o los usuarios de la aplicación jamás deben tener permiso para ver la bitácora.   

En relación con la gestión de secretos, si se escriben contraseñas en texto claro dentro de comandos SQL, la bitácora se convierte en un punto de fuga de información sensible. Para evitar esto, se deben usar herramientas seguras como \password que convierten la clave en un resumen encriptado antes de enviarla y restringir el acceso a los archivos de registro únicamente al personal de confianza