# Actividad 10 — Diseñar y crear el registro de auditoría

| Campo propuesto | Tipo | ¿Qué pregunta responde? | ¿Puede ser nulo? ¿Por qué? |
| :--- | :--- | :--- | :--- |
| **id_evento** | BIGSERIAL | ¿En qué orden correlativo ocurrió el evento? | **No.** Es la clave primaria autoincrementable que identifica de forma única cada registro. |
| **momento** | TIMESTAMPTZ | ¿Cuándo ocurrió la modificación exactamente? | **No.** Es indispensable tener la marca de tiempo precisa para reconstruir la cronología del hecho. |
| **usuario_sesion** | TEXT | ¿Quién se autenticó originalmente en la sesión? | **No.** Identifica a la persona real o cuenta que abrió la conexión, sin importar si cambió de rol después. |
| **usuario_efectivo** | TEXT | ¿Con qué rol se ejecutó la instrucción SQL? | **No.** Determina qué perfil específico tenía los permisos vigentes al hacer la modificación. |
| **aplicacion** | TEXT | ¿Desde qué programa o sistema se hizo el cambio? | **Sí.** Si el cliente de conexión no define un nombre de aplicación, el sistema guarda un valor nulo. |
| **ip_cliente** | INET | ¿Desde qué equipo o dirección de red se conectaron? | **Sí.** Las conexiones locales mediante socket de UNIX no tienen una dirección IP asignada. |
| **operacion** | TEXT | ¿Qué tipo de acción se realizó (INSERT, UPDATE, DELETE)? | **No.** Es obligatorio clasificar el tipo de evento ejecutado sobre el registro. |
| **id_cliente** | BIGINT | ¿A qué registro específico afectó el cambio? | **Sí.** En operaciones globales o donde no aplique un ID específico puede ser nulo. |
| **valores_antes** | JSONB | ¿Qué información tenía el registro antes del cambio? | **Sí.** En operaciones de inserción (INSERT) no existe un estado previo. |
| **valores_despues** | JSONB | ¿Cómo quedó la información después de la modificación? | **Sí.** En operaciones de borrado (DELETE) no queda un estado posterior. |

---

1. ¿Por qué momento usa TIMESTAMPTZ y no TIMESTAMP?

Porque TIMESTAMPTZ guarda la hora ajustada a un estándar universal (UTC) y conserva la información de la zona horaria. Si se usara TIMESTAMP sin zona horaria, la hora dependería de la configuración local del equipo, lo que provocaría confusiones y errores al intentar reconstruir la secuencia real de un evento si el servidor cambia de zona o si hay clientes en distintas regiones.   

2. ¿Por qué se guarda el registro completo en JSONB y no solo la columna que cambió?


Resistencia a cambios futuros: Si la tabla principal modifica sus columnas en el futuro, no hace falta estar alterando la estructura de la tabla de auditoría.   
Contexto completo: Permite ver la fotografía exacta de cómo estaba toda la fila en ese momento sin tener que adivinar o buscar información en otros lados.   
Consultas eficientes: El formato JSONB permite hacer búsquedas directas dentro de los datos guardados con una excelente velocidad.   

3. La tabla de auditoría también contendrá RFC. ¿Qué implica eso para su clasificación y su control de acceso?

* Clasificación: Significa que la tabla de auditoría pasa a resguardar datos personales confidenciales, por lo que debe tratarse con el mismo nivel de protección que la información del cliente.   

* Control de acceso: Debe bloquearse por completo el permiso de lectura y modificación a los usuarios comunes y aplicaciones web. Solo el proceso automático (el disparador) debe poder escribir en ella, y la consulta de sus datos debe quedar reservada exclusivamente para el equipo de administración de la base de datos y personal de seguridad autorizado.