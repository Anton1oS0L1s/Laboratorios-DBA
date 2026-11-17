# Actividad 2 — El incidente sin perfilado

**1. ¿Puedes demostrar qué cambió? ¿Y quién se conectó a esa hora?**

* Qué cambió:
    
    No existe evidencia en los registros del servidor sobre la operación ejecutada ni sobre el valor anterior del campo rfc. Únicamente se observa el estado actual del documento en la colección clientes al consultarlo directamente, dado que el perfilador estaba apagado y la bitácora de Community Edition no audita operaciones CRUD.

* Quién se conectó:
    
    Sí se puede demostrar mediante la bitácora del servidor, donde quedan registrados la hora exacta, el cliente de origen, el nombre de aplicación app-ventas-web y la autenticación exitosa del usuario app_ventas, aunque esto no vincula directamente la sesión con la modificación específica del registro.

**2. ¿Por qué mongosh abre varias conexiones para una sola instrucción? ¿Cuál es la que se autentica?**

* Motivo de múltiples conexiones:

    El cliente mongosh se apoya en el controlador de Node.js para MongoDB, el cual mantiene un grupo de conexiones y separa el monitoreo de topología de la ejecución de comandos. La primera conexión verifica la disponibilidad y estado del servidor antes de autenticar, mientras que la segunda gestiona la sesión operativa del usuario.

* Conexión autenticada:

    La segunda conexión de la secuencia, representada como conn9 en el ejemplo del laboratorio, es la que realiza el intercambio de credenciales y registra el evento Successfully authenticated en la categoría ACCESS; la primera conexión permanece sin autenticar al cumplir solo funciones de monitoreo y envío de metadatos.