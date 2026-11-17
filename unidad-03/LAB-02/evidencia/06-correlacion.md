# Actividad 6 — Correlacionar un cambio de configuración con su autor

**1. ¿Qué usuario cambió la configuración del perfilador? ¿Qué dos eventos lo demuestran?**

El cambio fue realizado por el usuario admin autenticado en la base de datos admin. Lo demuestran dos eventos vinculados por el mismo identificador de conexión ctx: primero el evento Successfully authenticated en la categoría ACCESS que asocia dicho ctx con el usuario admin, y segundo el evento Profiler settings changed que registra el cambio de nivel y filtro en la base comercial desde esa misma conexión.

**2. ¿Qué condición debe cumplirse para que esta correlación sea válida?**

Debe cumplirse que ambos eventos pertenezcan al mismo periodo de ejecución continua del servidor sin reinicios intermedios, y que la conexión no se haya cerrado entre la autenticación y el cambio de configuración. Como los identificadores ctx se reinician desde conn1 cada vez que arranca el servicio mongod, un reinicio reutiliza los mismos nombres de conexión para sesiones diferentes.

**3. ¿Por qué es relevante que quede registrado un cambio de configuración del propio mecanismo de registro?**

Porque apagar o alterar el perfilador es una maniobra frecuente para borrar rastros antes de manipular o extraer datos críticos. Registrar estas modificaciones en una bitácora separada permite detectar intentos de evasión, delimitar ventanas ciegas sin monitoreo y atribuir la responsabilidad a la cuenta administrativa que alteró el control.