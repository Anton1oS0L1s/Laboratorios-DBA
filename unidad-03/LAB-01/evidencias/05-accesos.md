# Actividad 5 - Accesos exitosos y fallidos

1. La bitácora registra el usuario app_ventas en el intento fallido. ¿Eso prueba que la aplicación de ventas intentó entrar? ¿Qué prueba realmente?

No. Cualquiera que intente conectarse puede escribir el nombre de usuario que desee en la orden de conexión. Esto únicamente demuestra que un cliente desde la dirección 127.0.0.1 intentó entrar afirmando llamarse app_ventas, pero no garantiza que se trate de la aplicación legítima.   

2. ¿Qué información adicional registra PostgreSQL cuando el rol no existe? ¿Por qué aparece en la bitácora y no en el mensaje que recibe el cliente?

Agrega un detalle adicional que indica explícitamente que la cuenta no existe (DETAIL: Role "usuario_inexistente" does not exist). Aparece solo en el registro interno por protección: si se le dijera al cliente que el usuario no existe, un atacante podría ir probando nombres hasta adivinar cuáles usuarios sí están dados de alta.   

3. ¿Por qué app=[unknown] en el intento fallido, pero app=app-ventas-web en la desconexión?

Porque el parámetro con el nombre del programa (application_name) solo se lee y se asigna una vez que la contraseña ha sido validada. Al fallar la clave, el servidor frena el acceso de inmediato y destruye la conexión sin procesar los datos del cliente.   

4. ¿Qué patrón de varias líneas te haría sospechar de un ataque de fuerza bruta?

Escribe la consulta que contaría los intentos fallidos por usuario. Una ráfaga continua de líneas con la marca FATAL señalando fallos en la contraseña, generadas en cuestión de segundos o milisegundos y proveniendo de la misma dirección IP.