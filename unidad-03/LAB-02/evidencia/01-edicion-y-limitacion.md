# Actividad 1 — Lo que no existe en esta edición

**1. ¿Qué edición de MongoDB estás usando? ¿Qué evidencia lo demuestra?**

Se utiliza MongoDB Community Edition versión 9.0.8. Se demuestra al consultar el atributo modules mediante el comando adminCommand con buildInfo, el cual devuelve un arreglo vacío en lugar de incluir el módulo enterprise.

**2. ¿A dónde escribe tu servidor su bitácora? ¿Cómo lo sabes?**

Escribe en el archivo local C:\Program Files\MongoDB\Server\9.0\log\mongod.log. Se comprueba en el bloque systemLog de la salida de serverCmdLineOpts, donde destination está configurado como file y path apunta a esa ruta física.

**3. Según REF-U3-04, ¿qué cuatro categorías de eventos registraría la auditoría nativa?**

* Autenticación y autorización de usuarios y roles.

* Cambios de esquema y estructura de bases de datos, colecciones e índices.

* Operaciones de lectura y escritura sobre documentos.

* Operaciones administrativas, de configuración y mantenimiento del sistema.

**4. ¿Qué tendría que evaluar una organización antes de licenciar Enterprise o migrar a Atlas solo para obtener auditoría?**

* El costo total de licenciamiento o suscripción en la nube frente al valor de los activos protegidos.

* El nivel de exigencia de las normativas legales y de cumplimiento aplicables al sector.

* Si los controles compensatorios en Community Edition resultan suficientes para cubrir sus riesgos operativos.

* Los requisitos de soberanía de datos, latencia, arquitectura de red y administración del servicio.