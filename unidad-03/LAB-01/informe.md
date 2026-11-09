# Informe

## 1. Despliegue y situación inicial
El servidor se desplegó sobre una instancia de PostgreSQL 18 (mediante contenedor Docker derivado de la imagen oficial / paquetes PGDG postgresql-18-pgaudit). En su instalación por defecto, PostgreSQL 18 redirige los mensajes a la salida estándar (stderr) sin persistencia en disco (logging_collector = off) y con la captura de sentencias deshabilitada (log_statement = 'none').

Esta configuración inicial impidió responder a las exigencias de Dirección tras el incidente del cambio no autorizado de RFC por las siguientes razones:
Sin atribuibilidad de sesión: Las conexiones no registraban quién se autenticaba, desde qué dirección IP ni con qué aplicación.
Sin registro de comandos (DML/DDL): Las instrucciones SQL ejecutadas por los usuarios no dejaban ningún rastro en los archivos del sistema.
Sin estado previo del dato: El motor no conservaba el valor anterior (OLD) de los registros modificados, imposibilitando la restauración precisa de la información.

## 2. Configuración aplicada
| Parámetro / Objeto | Valor aplicado | Requisito de aplicación | Justificación de seguridad |
| :--- | :--- | :--- | :--- |
| **logging_collector** | on | Reinicio (restart) | Activa el proceso en segundo plano que captura la bitácora y la escribe en archivos físicos dentro del servidor. |
| **log_destination** | stderr | Recarga (pg_reload_conf) | Define el canal de transmisión de eventos hacia el colector. |
| **log_directory** | log | Recarga (pg_reload_conf) | Establece la carpeta dentro del directorio de datos (PGDATA) donde se almacenan los archivos de registro. |
| **log_filename** | postgresql-%Y-%m-%d_%H%M%S.log | Recarga (pg_reload_conf) | Define el patrón de nomenclatura para controlar la rotación temporal de bitácoras. |
| **log_line_prefix** | %m [%p] user=%u db=%d app=%a client=%h  | Recarga (pg_reload_conf) | Añade contexto forense indispensable a cada línea: fecha/hora (%m), PID (%p), usuario (%u), base de datos (%d), aplicación (%a) e IP (%h). |
| **log_statement** | mod | Recarga (pg_reload_conf) | Registra todas las sentencias que modifican datos o estructura (INSERT, UPDATE, DELETE, DDL), omitiendo las lecturas masivas. |
| **log_min_error_statement** | error | Recarga (pg_reload_conf) | Fuerza la escritura en bitácora de cualquier consulta que provoque un error del motor o de permisos. |
| **shared_preload_libraries** | 'pgaudit' | Reinicio (restart) | Carga la biblioteca nativa pgaudit en la memoria compartida al arrancar PostgreSQL 18. |
| **pgaudit.log** | 'role, ddl' | Recarga (pg_reload_conf) | Establece el rastreo para cambios de privilegios, roles y modificaciones estructurales. |
| **pgaudit.role** | 'auditor_datos' | Recarga (pg_reload_conf) | Asigna el rol auditador que actúa como filtro para registrar accesos a columnas sensibles (rfc, telefono). |

## 3. Eventos observados
Conexión / Desconexión:
```Plaintext
2026-10-25 22:50:00.120 UTC [150] user=app_ventas db=comercial app=app-ventas-web client=127.0.0.1 LOG: connection authorized: user=app_ventas database=comercial application_name=app-ventas-web
```

Interpretación: Confirma el inicio de una sesión válida asignando el PID 150 a la aplicación web desde localhost.

Autenticación fallida:
```Plaintext
2026-10-25 22:50:05.410 UTC [152] user=app_ventas db=comercial app=[unknown] client=127.0.0.1 FATAL: password authentication failed for user "app_ventas"
```
Interpretación: Intento fallido de inicio de sesión por credenciales incorrectas. Se evidencia la IP de origen y el rechazo de la conexión.

Sentencia DDL / DCL:
```Plaintext
2026-10-25 22:50:09.800 UTC [155] user=postgres db=comercial app=psql client=[local] LOG: statement: GRANT UPDATE ON clientes TO app_ventas
```
Interpretación: Modificación de los derechos de acceso en el catálogo del sistema realizada por el administrador local.

Modificación de datos (DML):
```Plaintext
2026-10-25 22:50:20.601 UTC [162] user=app_ventas db=comercial app=app-ventas-web client=127.0.0.1 LOG: statement: UPDATE clientes SET telefono = '6679990000' WHERE id = 3
```
Interpretación: Sentencia UPDATE capturada bajo el nivel log_statement = 'mod'. Registra la intención y los valores nuevos de la consulta SQL, pero no el valor previo del teléfono.

Error por permisos denegados:
```Plaintext
2026-10-25 22:50:25.330 UTC [168] user=soporte_ana db=comercial app=psql client=127.0.0.1 ERROR: permission denied for table clientes
2026-10-25 22:50:25.330 UTC [168] user=soporte_ana db=comercial app=psql client=127.0.0.1 STATEMENT: DELETE FROM clientes WHERE id = 5
```

Interpretación: Intento no autorizado de borrado bloqueado por el sistema RBAC. Quedan registrados tanto el error como la sentencia que lo originó.

Auditoría de objeto (pgaudit):
```Plaintext
2026-10-25 22:51:10.005 UTC [170] user=app_ventas db=comercial app=app-ventas-web client=127.0.0.1 LOG: AUDIT: OBJECT,1,1,READ,SELECT,TABLE,public.clientes,"SELECT nombre, rfc FROM clientes WHERE id = 3",<not logged>
```

Interpretación: pgaudit captura una consulta de lectura (SELECT) porque involucra la columna sensible rfc, sobre la cual el rol auditor_datos tiene privilegios de monitoreo.

## 4. Auditoría del dato
Diseño de la tabla auditoria.cambios_clientes

Para resolver la falta de contexto histórico se creó el esquema auditoria y la tabla cambios_clientes:

* usuario_sesion (session_user): Registra el usuario real que abrió la conexión a la base de datos, manteniéndose inalterado aunque la función cambie de contexto.
* usuario_efectivo (current_user): Muestra el rol en ejecución al momento del cambio.
* valores_antes y valores_despues (JSONB): Capturan el registro completo (to_jsonb(OLD) y to_jsonb(NEW)), haciendo el diseño inmune a cambios futuros en la estructura de la tabla clientes.

Papel de SECURITY DEFINER y session_user

* SECURITY DEFINER: Ejecuta la función del disparador con los privilegios del propietario (postgres). Esto permite que la cuenta app_ventas inserte registros en auditoria.cambios_clientes al modificar un cliente, sin necesidad de darle permisos directos de INSERT o SELECT sobre el esquema de auditoría.

* session_user: Al usar session_user en lugar de current_user dentro de una función SECURITY DEFINER, se evita que todos los eventos aparezcan atribuidos a postgres, conservando la identidad real del usuario de la sesión (app_ventas).

Resultado del incidente auditado

Durante el evento de la Actividad 12 (UPDATE clientes SET rfc = 'GAMA780912ZZZ' WHERE id = 3), el disparador capturó en auditoria.cambios_clientes (id_evento = 1):

* Identidad: usuario_sesion = 'app_ventas', ip_cliente = '127.0.0.1', aplicacion = 'app-ventas-web'.

* Comparación JSONB:
    * antes: {"rfc": "GAMA780912XYZ"}
    * despues: {"rfc": "GAMA780912ZZZ"}

## 5. Limitaciones
* Monitoreo de Lecturas: Las sentencias SELECT no activan disparadores DML ni se registran con log_statement = 'mod'. Usar log_statement = 'all' para capturarlas satura el almacenamiento; por ello se requiere la extensión 
pgaudit.

* Impacto por Volumen: Un UPDATE masivo sin WHERE en una tabla con millones de filas ejecuta el disparador por cada fila (FOR EACH ROW), generando millones de inserciones en JSONB, consumiendo gran cantidad de espacio en disco y bloqueando la tabla durante la transacción.

* Bypass por Superusuario: Un usuario con rol postgres puede desactivar el disparador (ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes), realizar cambios sin dejar rastro en la tabla de auditoría y reactivarlo posteriormente.

## 6. Riesgos de la bitácora
* Exposición de credenciales: Sentencias como CREATE ROLE escritas en texto plano dejan la contraseña grabada en la bitácora física del servidor. Se debe exigir el uso de \password o comandos que envíen el hash SCRAM-SHA-256 sin exponer la clave original.

* Pérdida por fallo del nodo: Mantener los archivos .log exclusivamente en el servidor donde opera PostgreSQL 18 expone la evidencia a ser borrada si el contenedor, disco o máquina virtual se reinstala o destruye.

* Acceso no autorizado: Si los permisos de lectura a nivel de sistema operativo en el directorio pg_wal o log no están restringidos (0600), usuarios locales no privilegiados podrían leer la bitácora y consultar información confidencial.

## 7. Cronología y conclusión
**¿Con esta configuración puede demostrarse quién cambió un dato sensible y qué valor tenía antes?**
    
Para cambios procesados con el disparador activo (Parte B): Sí. La combinación del disparador con la tabla JSONB conserva la marca de tiempo, la IP, la identidad del usuario de sesión (session_user) y la fotografía exacta del estado anterior (OLD) y posterior (NEW).

Para cambios con el disparador desactivado o previos a la auditoría (Actividades 3, 7 y 14): Parcialmente. La bitácora del servidor (log_statement = 'mod') permite identificar la hora, IP, usuario y comando ejecutor, pero no conserva el valor que tenía el dato antes de la modificación.

Conclusión global: La bitácora del servidor y la tabla de auditoría con disparadores son mecanismos complementarios. Para garantizar la inmutabilidad y la no suplantación por parte de superusuarios, es indispensable exportar las bitácoras en tiempo real (mediante syslog o SIEM) a un custodia externo independiente del administrador del motor.

## Preguntas de reflexión

1. ¿Por qué la auditoría no puede configurarse después de un incidente para investigarlo?

Porque la auditoría en bases de datos es estrictamente preventiva y opera en tiempo real. Si el motor o la tabla no tenían activos los mecanismos de captura (logging_collector, log_statement o disparadores) al momento de la transacción, el sistema no guardó la marca de tiempo, el usuario ni los valores en memoria. Intentar activarlos de forma posterior solo registrará los eventos futuros, siendo imposible recuperar evidencia de sucesos pasados.

2. ¿Por me conviene que la bitácora la administre el propio servidor y no el mecanismo de despliegue?

El colector interno del servidor (logging_collector) se ejecuta dentro del propio proceso de PostgreSQL, lo que le permite capturar de forma síncrona y estructurada eventos críticos como errores de inicio de sesión, caídas de procesos hijo y mensajes del sistema. Los mecanismos de despliegue (como la captura de stdout/stderr en contenedores) son propensos a perder eventos ante cierres inesperados, sufren de búferes desincronizados y mezclan la salida con mensajes de la infraestructura, perdiendo la estructura de campos requerida para un análisis forense.

3. ¿Por qué el prefijo de línea es tan importante como el nivel de log_statement?

log_statement determina qué instrucción SQL se va a escribir en la bitácora, pero sin un prefijo de línea (log_line_prefix), la sentencia no se puede asociar a un responsable. El prefijo aporta la metainformación de contexto indispensable para un peritaje: cuándo ocurrió (%m), qué proceso lo ejecutó (%p), quién era el usuario (%u), a qué base de datos se conectó (%d), qué aplicación usó (%a) y desde qué dirección IP provenía (%h).

4. ¿Qué diferencia práctica hay entre registrar la sentencia y registrar el 
cambio en el dato?

* Registrar la sentencia (Bitácora): Asienta la consulta ejecutada (ej. UPDATE clientes SET rfc = 'XXX' WHERE id = 3). Muestra la acción intentada por el usuario, pero no revela qué valor estaba guardado en esa celda antes del cambio.

* Registrar el cambio en el dato (Disparador / Auditoría JSONB): Asienta la fotografía completa de la fila antes (OLD) y después (NEW). Esto permite evaluar el impacto real del cambio y proporciona la información exacta necesaria para restaurar el estado original en caso de un error o ataque.

5. ¿Qué evidencia ofrece pg_stat_activity que no ofrece la bitácora, y viceversa?

* pg_stat_activity: Muestra información en tiempo real y volátil de las sesiones activas en ese preciso instante (consultas en ejecución, bloqueos, tiempos de espera, transacciones abiertas). En cuanto la sesión o la consulta termina, los datos desaparecen de la vista.

* Bitácora del servidor: Ofrece un registro histórico persistente. No muestra el estado dinámico de la memoria RAM en vivo, pero almacena de forma permanente los eventos, errores, conexiones finalizadas y sentencias ejecutadas en el pasado.

6. Si el administrador puede cambiar log_statement a none y desactivar el disparador, ¿quién audita al administrador?

Al administrador lo auditan mecanismos y controles externos a la base de datos, cumpliendo el principio de separación de funciones:

* Envío de bitácoras a un SIEM/Syslog externo: Los registros del servidor se transmiten de forma continua a un servidor centralizador inmutable controlado por el equipo de Seguridad de la Información, impidiendo que el administrador los modifique o borre localmente.

* Auditoría del Sistema Operativo: Herramientas a nivel de kernel (como auditd en Linux) supervisan las acciones del usuario root o postgres, registrando cambios en los archivos de configuración (postgresql.conf) y reinicios del servicio.

* Control de Acceso y Gestión de Credenciales (PAM): El uso de cuentas superusuario requiere aprobación previa, sesión grabada y autenticación multifactor.