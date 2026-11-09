# Actividad 1 — Registro por defecto
1. ¿Con esta configuración, se registra quién se conecta?
No. Al estar desactivada la opción (log_connections = off), el sistema ignora y no guarda ningún registro cuando alguien entra o intenta entrar a la base de datos.


2. ¿Se registran las sentencias UPDATE?
No. La opción para registrar acciones está en none, lo que significa que el servidor no guarda ningún comando de modificación ni consulta.


3. ¿La línea de bitácora incluye el usuario o la dirección IP del cliente?
No. El formato actual solo anota la hora exacta y el número de proceso del servidor, dejando fuera el nombre del usuario y la dirección de la computadora desde donde se conectó.


4. ¿En qué zona horaria se registran los eventos? ¿Por qué importa al reconstruir una cronología?
Se guardan en horario Etc/UTC (el tiempo universal). Importa porque al investigar un incidente se necesita comparar las horas con otros sistemas (como páginas web o redes); si cada equipo usa un horario distinto, es muy difícil saber qué pasó primero.


5. Con logging_collector = off, ¿quién decide dónde termina la bitácora: PostgreSQL o el mecanismo con que se desplegó el servidor?
El mecanismo de despliegue (el sistema operativo, Docker o la herramienta que enciende el servidor). PostgreSQL solo avienta los mensajes hacia la salida del sistema, y es esa plataforma externa la que decide si los guarda en un archivo, los muestra en pantalla o los borra.