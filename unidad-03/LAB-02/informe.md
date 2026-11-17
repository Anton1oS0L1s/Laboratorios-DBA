# Informe

## 1. Despliegue, edición y limitación

**Despliegue del servidor**:

El entorno de pruebas se desplegó de manera local sobre sistema operativo Windows ejecutando MongoDB 9.0.8 Community Edition registrado como servicio del sistema bajo el nombre MongoDB. 

La configuración del motor se estableció en el archivo mongod.cfg habilitando el control de acceso mediante security.authorization en valor enabled, restringiendo la escucha de red a la interfaz local 127.0.0.1 en el puerto 27017, y configurando la salida persistente de eventos hacia archivo físico en disco mediante systemLog.destination en file con systemLog.logAppend en true. La administración se realizó mediante MongoDB Compass y la terminal PowerShell utilizando el cliente mongosh.

**Funcionalidades inexistentes en Community Edition**:

Esta edición carece del subsistema nativo de auditoría de seguridad conocido como auditLog, el cual está reservado exclusivamente para MongoDB Enterprise Edition y MongoDB Atlas. 

Como consecuencia directa, el motor no dispone de registros nativos estructurados para operaciones de lectura y escritura CRUD, comandos de definición de estructura DDL, ni eventos de asignación o revocación de roles y privilegios. Tampoco almacena imágenes previas de los documentos antes de ser modificados o eliminados.

**Método de verificación en el laboratorio**:

La ausencia de capacidades de auditoría nativa se comprobó en tres pasos:
* Se consultó el comando buildInfo verificando que el arreglo modules se encuentra vacío y no incluye el módulo enterprise.
* En la Actividad 2 se ejecutó una actualización sobre el campo rfc de un cliente con el perfilador apagado en nivel 0, confirmando cero registros en system.profile y cero coincidencias de la operación en la bitácora del servidor.
* En la Actividad 7 se ejecutó el comando grantRolesToUser con el perfilador activo en nivel 2, comprobando que ni system.profile ni la bitácora del servidor registraron la modificación de privilegios.

---

## 2. Perfilador

**Configuración**:

El perfilador de base de datos se administra por base individual mediante db.setProfilingLevel o de forma global permanente en mongod.cfg bajo la sección operationProfiling.mode. Durante el laboratorio se evaluaron tres configuraciones:

* Nivel 0 o modo off: estado predeterminado donde no se captura ninguna operación.
* Nivel 2 o modo all: captura la totalidad de consultas, comandos y operaciones de escritura ejecutadas sobre la base de datos.
* Nivel 1 con expresión de filtro filter: mediante la condición sobre el campo op con los valores insert, update y remove, se descartaron las consultas cotidianas y se conservaron exclusivamente las operaciones que alteran datos.

**Interpretación**:

Cada documento registrado en la colección circular system.profile permite reconstruir el contexto operativo de la instrucción mediante campos clave:

* op y ns: indican el tipo de operación y el espacio de nombres completo formado por base de datos y colección.
* command: conserva el filtro de búsqueda y los operadores de actualización recibidos por el motor.
* user, client y appName: identifican la cuenta autenticada junto con su base de autenticación como app_ventas@comercial, la dirección IP de origen y el identificador declarado por la aplicación como app-ventas-web.
* ts, millis, docsExamined, nreturned, nModified y ndeleted: precisan el instante exacto de ejecución, el tiempo consumido y el alcance numérico de los documentos afectados, aunque nunca muestran el contenido previo del documento alterado.

**Costo operativo y de conservación**:

Mantener el perfilador en nivel 2 introduce sobrecarga de escritura en disco y degrada el rendimiento ante cargas elevadas de lectura. Además, system.profile es una colección circular con tamaño fijo predeterminado de 1 MB; bajo alto tráfico, los registros nuevos sobrescriben rápidamente a los antiguos destruyendo la evidencia reciente. Finalmente, la configuración activada desde consola es volátil y vuelve al nivel 0 tras reiniciar el servicio.

---

## 3. Bitácora de mongod

**Ubicación y mecanismos de consulta**:

La bitácora del servidor se escribe de forma continua en formato JSON estructurado dentro del archivo definido en systemLog.path, ubicado en C:\Program Files\MongoDB\Server\9.0\log\mongod.log. Adicionalmente, el proceso mongod conserva en memoria RAM un búfer circular con los últimos 1024 eventos, consultable remotamente desde consola mediante db.adminCommand con el parámetro getLog en modo global.

**Registro de accesos**:

Dentro de la categoría ACCESS, la bitácora documenta con precisión todos los intentos de autenticación:

* Accesos exitosos: generan el mensaje Successfully authenticated con identificador 5286306 y código de resultado 0, detallando el usuario, la base de autenticación, la dirección IP con puerto efímero y el nombre de la aplicación cliente.
* Accesos fallidos: generan el mensaje Failed to authenticate con identificador 5286307 y código de resultado distinto de cero. Internamente, el servidor distingue una contraseña incorrecta mediante SCRAM authentication failed, storedKey mismatch con resultado 18 frente a un usuario inexistente mediante UserNotFound con resultado 11, mientras entrega al cliente remoto un mensaje genérico de fallo de autenticación para prevenir la enumeración de cuentas válidas.

**Cambios de configuración**:

Toda modificación dinámica sobre los parámetros del perfilador queda asentada en la bitácora bajo el mensaje Profiler settings changed, especificando la configuración anterior en from, la nueva en to y la base de datos afectada. 

Aunque este evento no contiene directamente el campo de usuario, incluye el identificador de conexión ctx, el cual permite correlacionarlo con el evento 
Successfully authenticated de esa misma sesión para identificar al administrador responsable, siempre que ambos eventos pertenezcan al mismo ciclo continuo de ejecución del servidor sin reinicios ni cierres intermedios de conexión.

---

## 4. Privilegios

**Evidencia disponible**:

MongoDB Community Edition no genera registros nativos cuando se crean, modifican o eliminan usuarios o roles. Durante la Actividad 7 se demostró que al ejecutar grantRolesToUser y revokeRolesFromUser sobre app_ventas, el conteo de eventos relacionados tanto en system.profile como en la bitácora del servidor fue igual a cero.

**Control compensatorio**:

Para mitigar esta brecha, se implementó la colección auditoria.instantaneas_privilegios, donde se almacenan periódicamente cortes del estado de autorización con la marca temporal en momento, la identidad de la sesión recolectora en tomada_por y el inventario completo de usuarios y roles extraído mediante db.getUsers. 

Para preservar la confiabilidad de este control, los permisos de escritura sobre dicha colección deben asignarse exclusivamente a una cuenta de servicio automatizada con privilegio único de inserción, impidiendo que administradores cotidianos o cuentas de aplicación modifiquen o eliminen registros históricos.

**Límite del control compensatorio**:

La comparación entre dos instantáneas sucesivas responde con certeza si cambiaron los privilegios de un usuario y qué rol específico fue añadido o retirado, pero no permite determinar qué cuenta administrativa ejecutó el cambio ni el segundo exacto en que ocurrió, dejando una ventana ciega equivalente al intervalo transcurrido entre ambas capturas.

---

## 5. Conservación

**Riesgos observados**:

Durante el laboratorio se comprobaron tres mecanismos mediante los cuales la evidencia de trazabilidad se pierde sin que exista borrado malicioso:

* Sobrescritura circular en system.profile: al alcanzar su límite fijo de 1 MB, el motor reemplaza automáticamente los documentos más antiguos por las operaciones entrantes.
* Volatilidad ante reinicios del servicio: reiniciar el servicio MongoDB vacía por completo el búfer en memoria de getLog y restablece el perfilador configurado dinámicamente al nivel 0.
* Desbordamiento de memoria o sobrescritura de archivo: superar los 1024 eventos en getLog expulsa los registros previos de la memoria, y reiniciar el servidor sin logAppend en true reemplaza el archivo físico de bitácora.

**Exportación e integridad realizada**:

Antes de reiniciar el servicio en la Actividad 8, se ejecutó la extracción preventiva de ambas fuentes de evidencia hacia el repositorio local:

* Exportación de system.profile en formato Extended JSON hacia evidencias/system-profile.json.
* Extracción del búfer activo de getLog hacia evidencias/bitacora-mongod.log y respaldo del archivo físico completo hacia evidencias/mongod-servidor.log.
* Cálculo de huellas criptográficas SHA-256 mediante Get-FileHash sobre cada archivo exportado, almacenando los resultados en evidencias/hashes.sha256 para asegurar la integridad y verificabilidad de las pruebas recolectadas.

---

## 6. Comparación

| Evento auditable | PostgreSQL con bitácora y disparador | MongoDB Community con perfilador y bitácora | MongoDB Enterprise o Atlas con auditoría nativa |
| :--- | :--- | :--- | :--- |
| Acceso exitoso | Sí observado | Sí observado | Documentado, no practicado |
| Acceso fallido | Sí observado | Sí observado | Documentado, no practicado |
| Cambio de privilegios | Sí observado | Parcial: sin registro nativo; detectado solo mediante instantáneas periódicas que indican qué roles cambiaron entre cortes, sin autor ni hora exacta | Documentado, no practicado |
| Cambio de estructura | Sí observado | Parcial: el perfilador en nivel 2 captura creación o borrado de colecciones e índices si está activo y no se sobrescribe su límite de 1 MB | Documentado, no practicado |
| Modificación de datos | Sí observado | Parcial: el perfilador registra insert, update y remove con usuario y aplicación mientras esté activo y se exporte antes de sobrescribirse | Documentado, no practicado |
| Valor anterior del dato | Sí observado | No | Documentado, no practicado: registra la instrucción y parámetros enviados sin guardar copias previas completas de los documentos |
| Lectura de datos sensibles | Parcial: disparadores no cubren SELECT y log_statement en modo mod las omite; requiere modo all o pgaudit con alto volumen | Parcial: el perfilador en nivel 2 registra consultas find con su filtro, pero se pierde al filtrar solo escrituras y expone datos en texto claro | Documentado, no practicado |
| Cambio de configuración del registro | Parcial: comandos ALTER SYSTEM se auditan en SQL, pero ediciones directas en postgresql.conf requieren control en sistema operativo | Sí observado | Documentado, no practicado |

---

## 7. Recomendación

Para una organización que requiere auditar de forma confiable y verificable los cambios de privilegios en MongoDB, la recomendación técnica se fundamenta en separar explícitamente los hechos comprobados en el laboratorio de los supuestos operativos del entorno productivo.

**Hechos verificados**:

* MongoDB 9.0.8 Community Edition no registra comandos de asignación o revocación de roles como grantRolesToUser ni revokeRolesFromUser en la bitácora del servidor ni en system.profile, incluso con el perfilador configurado en nivel 2.

* El control compensatorio basado en instantáneas periódicas sobre auditoria.instantaneas_privilegios detecta qué roles cambiaron entre dos puntos en el tiempo, pero no identifica al usuario autor del cambio ni el momento exacto en que se ejecutó.

* La documentación oficial de MongoDB establece que MongoDB Enterprise Edition y MongoDB Atlas incorporan el subsistema nativo auditLog, el cual registra eventos administrativos de gestión de usuarios y roles incluyendo autoría, origen y marca de tiempo.

**Supuestos organizacionales y operativos**:

* Se asume que la organización está sujeta a requisitos de cumplimiento normativo o auditoría interna que exigen atribución individual inequívoca y trazabilidad cronológica exacta sobre toda elevación de privilegios.
* Se asume que la organización cuenta con presupuesto para licenciamiento comercial o suscripción gestionada, o bien con capacidad operativa para administrar controles externos de segregación de funciones.
* Se asume que existe o puede desplegarse un repositorio externo centralizado de registros de solo escritura, como un servidor SIEM, fuera del alcance de modificación de los administradores de bases de datos.

**Recomendación técnica**:

Si el cumplimiento normativo exige demostrar quién otorgó o revocó privilegios y en qué instante preciso ocurrió, se recomienda migrar a MongoDB Enterprise Edition o MongoDB Atlas habilitando la auditoría nativa auditLog filtrada para eventos de autenticación, autorización y administración de roles, enviando dichos registros en tiempo real hacia un sistema SIEM externo e inmutable. 

Si restricciones presupuestarias obligan a permanecer temporalmente en MongoDB Community Edition, se deberá mantener la automatización de instantáneas en auditoria.instantaneas_privilegios cada 15 minutos mediante una cuenta de servicio con privilegio exclusivo de inserción, restringir los roles administrativos userAdminAnyDatabase y root mediante una bóveda de credenciales con aprobación previa, y exigir que todo cambio de permisos se ejecute exclusivamente dentro de ventanas de mantenimiento documentadas.

---

# Preguntas de reflexión

**1. ¿Por qué el perfilador no debe presentarse como un mecanismo de auditoría de seguridad?**

Porque su diseño responde a un propósito de diagnóstico de rendimiento y optimización de consultas, no de seguridad ni cumplimiento normativo. Carece de garantías de integridad e inmutabilidad, almacena los registros en una colección circular fija de 1 MB que sobrescribe silenciosamente la evidencia más antigua bajo carga operativa, se desactiva automáticamente al reiniciar el servicio si no se fija en archivo de configuración, omite comandos críticos como los cambios de privilegios y no conserva imágenes previas de los datos modificados o eliminados.

**2. ¿Por qué el perfilador sí aporta trazabilidad aunque no sea auditoría?**

Porque cuando se configura adecuadamente con filtros de escritura y exportación periódica, permite reconstruir la secuencia de operaciones ejecutadas sobre los datos vinculando cada instrucción con la cuenta autenticada, la dirección IP de origen, el nombre de la aplicación cliente y la marca temporal exacta. Esta información resulta valiosa para investigar incidentes operativos, rastrear modificaciones recientes en colecciones críticas y correlacionar eventos entre la aplicación y el motor de base de datos.

**3. ¿Qué riesgo introduce el nivel 2 al registrar filtros de consultas que pueden contener datos personales?**

Introduce un riesgo grave de exposición secundaria de información confidencial y cumplimiento de privacidad. Al capturar todas las consultas de lectura junto con sus criterios de filtrado en texto claro dentro de system.profile, datos sensibles como números de identificación fiscal, correos electrónicos, teléfonos o datos médicos utilizados como parámetros de búsqueda quedan duplicados sin cifrado adicional en una colección accesible para cualquier usuario con privilegios de lectura administrativa o en archivos exportados sin control de acceso estricto.

**4. ¿Qué diferencia hay entre detectar un cambio y atribuirlo a alguien?**

Detectar un cambio significa comprobar objetivamente que el estado de un dato o de un privilegio difiere respecto a un estado anterior, tal como ocurre al comparar dos instantáneas de roles o revisar el valor actual de un documento. Atribuirlo a alguien exige demostrar de forma verificable qué cuenta autenticada, desde qué origen y en qué momento preciso ejecutó la instrucción que produjo dicha alteración. Sin atribución individual no es posible establecer responsabilidad administrativa ni jurídica ante un incidente de seguridad.

**5. ¿Por qué reconocer una limitación técnica es parte del trabajo profesional del DBA?**

Porque ocultar o subestimar las carencias nativas de una plataforma expone a la organización a falsas expectativas de seguridad, incumplimientos normativos y pérdida irreversible de evidencia durante una auditoría o brecha real. Documentar con rigor qué puede demostrar la herramienta, qué no puede registrar y qué controles compensatorios o actualizaciones de edición se requieren permite a la Dirección tomar decisiones informadas de gestión de riesgos e inversión tecnológica.