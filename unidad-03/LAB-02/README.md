# LAB-02 — Trazabilidad en MongoDB Community
Repositorio de prácticas, evidencias e informe técnico correspondiente al laboratorio LAB-02 de la Unidad III sobre Gestión de Seguridad y Desempeño de Bases de Datos.

## Versión y despliegue del servidor según Anexo A
* **Motor y edición**: MongoDB 9.0.8 Community Edition con arreglo modules vacío.

* **Sistema operativo y método de despliegue**: Instalación local nativa como servicio de Windows llamado MongoDB, administrada mediante PowerShell, la consola integrada de MongoDB Compass y la terminal mongosh.

* **Archivo de configuración**: C:\Program Files\MongoDB\Server\9.0\bin\mongod.cfg

* **Autorización**: parámetro security.authorization configurado en enabled con autenticación SCRAM obligatoria.

* **Bitácora del servidor**: parámetro systemLog.destination en file, logAppend en true y salida JSON estructurada en C:\Program Files\MongoDB\Server\9.0\log\mongod.log.

* **Red**: enlace local en la dirección 127.0.0.1 y puerto 27017.