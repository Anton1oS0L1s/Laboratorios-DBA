# Actividad 5 — Accesos en la bitácora de mongod

?**1. ¿Qué campo distingue un acceso fallido de uno exitoso?**

Se distinguen principalmente mediante el campo msg, que toma el valor Failed to authenticate en intentos rechazados y Successfully authenticated en accesos válidos. De forma complementaria, el campo id registra 5286307 frente a 5286306, y el campo attr.result marca 0 en accesos exitosos frente a códigos de error como 18 o 11 en fallidos, acompañados del detalle interno en attr.error.

**2. ¿Qué diferencia hay entre el error de contraseña incorrecta y el de usuario inexistente? ¿Por qué el cliente recibe el mismo mensaje en ambos casos??**

* Diferencia en bitácora: 

La contraseña incorrecta genera AuthenticationFailed, SCRAM authentication failed, storedKey mismatch con resultado 18, mientras que el usuario inexistente genera UserNotFound, Could not find user con resultado 11.

* Motivo del mensaje genérico al cliente:

El servidor responde siempre con MongoServerError, Authentication failed. para impedir la enumeración de cuentas válidas por parte de posibles atacantes externos.

**3. ¿Por qué el nombre de la aplicación del intento fallido es mongosh 2.10.0 y no app-ventas-web??**

Porque las cadenas de conexión usadas en los intentos fallidos no incluyeron el parámetro appName=app-ventas-web, por lo que el cliente envió por defecto el nombre y la versión del intérprete mongosh empleado en la terminal.