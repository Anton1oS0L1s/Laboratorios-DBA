# Actividad 2 - Que el servidor administre su propia bitácora

1. ¿Por qué logging_collector requiere reinicio y log_statement solo recarga?

    logging_collector es como encender un componente nuevo dentro del programa para guardar los registros en el equipo, por lo que es obligatorio apagar y volver a encender la base de datos para que arranque. En cambio, log_statement es solo una instrucción de trabajo en memoria, así que basta con aplicarle un "refrescar" para que empiece a obedecer la nueva regla.

2. ¿Qué ventaja tiene que la bitácora se lea con SQL y no con una herramienta del sistema operativo o del contenedor? ¿Qué riesgo introduce?

    Ventaja: Permite buscar y filtrar el historial usando consultas normales desde la propia base de datos, sin depender de accesos por terminal ni permisos especiales de administrador en la computadora o servidor.   

    Riesgo: Si no se cuida el acceso, un usuario podría usar esa misma función para intentar abrir y leer otros archivos guardados en el equipo.

3. ¿Quién debería poder consultar dba.bitacora?

    Únicamente los administradores de la base de datos y el equipo de seguridad. Ningún usuario común ni la cuenta de la aplicación web debe tener permiso para verla.