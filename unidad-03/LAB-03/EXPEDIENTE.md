# Expediente

## 1. Alcance


**Sistemas evaluados:**
* **PostgreSQL 16:** Base de datos operativa comercial con los esquemas public, auditoria, gobierno y dba.
* **MongoDB 7 Community Edition:** Base de datos operativa comercial con las colecciones clientes y system.profile.
* **Periodo revisado:** Ciclo operativo correspondiente a las prácticas LAB-01, LAB-02 y LAB-03 de la Unidad III, comprendido entre octubre y noviembre de 2026.
* **Responsable de la integración:** Marco Antonio Solís Rojo — Administrador de Bases de Datos en funciones de Custodio técnico.

## 2. Configuración de auditoría (A3)

Los mecanismos de trazabilidad y registro activos en ambos motores se acreditan mediante las evidencias técnicas almacenadas en el directorio evidencias:

* **Bitácora de actividad en PostgreSQL 16:** Respaldada en evidencias/E1-configuracion-registro.txt. El colector de logs está activo mediante logging_collector = on, registrando aperturas y cierres de sesión con log_connections = on y log_disconnections = on. Las sentencias de modificación de datos y estructura se capturan con log_statement = mod, identificando marca de tiempo, identificador de proceso, usuario y base mediante log_line_prefix = '%m [%p] %q%u@%d '.

* **Auditoría del dato a nivel de fila en PostgreSQL 16:** Respaldada en evidencias/E3-disparadores.txt y evidencias/E4-muestra-auditoria.txt. El disparador trg_auditoria_clientes se encuentra habilitado sobre public.clientes con estado O, ejecutándose tras cada operación INSERT, UPDATE y DELETE por fila mediante una función SECURITY DEFINER que almacena los estados previo y posterior en auditoria.cambios_clientes.

* **Matriz vigente de privilegios en PostgreSQL 16:** Documentada en evidencias/E2-privilegios.txt, donde consta que app_ventas posee SELECT, UPDATE y soporte_ana posee SELECT directo sobre public.clientes.

* **Perfilado y registro en MongoDB 7:** Respaldados en evidencias/system-profile.json, evidencias/bitacora-mongod.log y evidencias/09-comparacion.md. El perfilador opera en nivel 2 sobre la colección rotativa comercial.system.profile de 1 MB y el servidor registra eventos operativos en la bitácora de mongod.

## 3. Bitácora interpretada (A3, A5)


A continuación se interpretan cuatro eventos relevantes extraídos de evidencias/E5-bitacora-postgresql.log y evidencias/E4-muestra-auditoria.txt:


### Evento 1 — Alteración del RFC de María García (id = 3)
* **Quién:** Usuario de sesión app_ventas operando bajo el identificador autodeclarado app-ventas-web.
* **Cuándo:** Registrado en el historial de eventos de auditoria.cambios_clientes en LAB-01 Parte B y reflejado en la secuencia de evidencias/E4-muestra-auditoria.txt.
* **Desde dónde:** Dirección IP 127.0.0.1 dentro de la red local del contenedor.
* **Qué ocurrió:** Ejecución de una sentencia UPDATE sobre public.clientes para el registro id = 3, modificando el valor del campo rfc.
* **Tipo de evento:** Modificación de dato personal y fiscal a nivel de fila.
* **Qué prueba:** Acredita la identidad de la cuenta de base de datos, la dirección origen y los valores exactos antes y después del cambio, permitiendo al área de Facturación restablecer el RFC legítimo. Asimismo, evidencia que el parámetro application_name puede ser definido libremente por el cliente sin autenticación criptográfica.

### Evento 2 — Desactivación y reactivación del disparador por el superusuario
* **Quién:** Usuario postgres.
* **Cuándo:** 2026-10-25 22:50:53.549 y 2026-10-25 22:50:53.554, asentado en las líneas 169 y 171 de evidencias/E5-bitacora-postgresql.log.
* **Desde dónde:** Sesión administrativa local postgres@comercial.
* **Qué ocurrió:** Ejecución de ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes, seguida de la modificación de un RFC sin generar registro en auditoria.cambios_clientes, y posterior ejecución de ALTER TABLE clientes ENABLE TRIGGER trg_auditoria_clientes cinco milisegundos después.
* **Tipo de evento:** Alteración de estructura de control y evasión de auditoría.
* **Qué prueba:** Demuestra que el superusuario técnico tiene capacidad para suspender la auditoría de tabla y ocultar cambios de datos, pero confirma que la bitácora externa del servidor conserva la evidencia de la manipulación de controles.

### Evento 3 — Intento rechazado de desactivar el disparador desde cuenta de aplicación
* **Quién:** Usuario app_ventas.
* **Cuándo:** 2026-10-25 22:50:53.460, asentado en la línea 163 de evidencias/E5-bitacora-postgresql.log.
* **Desde dónde:** Sesión de red app_ventas@comercial.
* **Qué ocurrió:** Intento de ejecución de ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes, denegado por el motor con el error de falta de propiedad sobre la tabla clientes.
* **Tipo de evento:** Intento no autorizado de modificación estructural.
* **Qué prueba:** Verifica que la separación de propiedad entre tablas y cuentas de aplicación impide que el usuario operativo deshabilite sus propios controles de trazabilidad.

### Evento 4 — Incorporación autorizada de columna canal_alta bajo folio CAM-2026-014
* **Quién:** Usuario postgres.
* **Cuándo:** 2026-10-25 22:54:26.533, asentado en la línea 216 de evidencias/E5-bitacora-postgresql.log.
* **Desde dónde:** Sesión administrativa postgres@comercial.
* **Qué ocurrió:** Ejecución de ALTER TABLE clientes ADD COLUMN canal_alta VARCHAR(20); acompañada de la actualización del metadato mediante COMMENT ON COLUMN.
* **Tipo de evento:** Cambio de esquema aprobado en ambiente de producción.
* **Qué prueba:** Acredita la aplicación efectiva del flujo de gobierno establecido en POL-06, al existir solicitud previa aprobada por el Comité de cambios en gobierno.solicitudes_cambio y ejecución dentro de la ventana autorizada.

## 4. Elementos de gobierno (A1, A2)

### 4.1 Asignación de responsabilidades (evidencias/02-responsables.md)
Se establece separación formal entre autoridad de negocio y operación técnica:

* **comercial.public.clientes y comercial.clientes:** Propietario: Gerencia Comercial; Custodio: DBA; Usuarios autorizados: app_ventas, Facturación y Soporte Técnico.
* **auditoria.cambios_clientes y comercial.system.profile:** Propietario: Auditoría Interna y Seguridad de la Información; Custodio: DBA sin permisos de alteración de registros; Usuarios autorizados: Auditoría Interna en modo lectura.
* **Bitácora de PostgreSQL y gobierno.solicitudes_cambio:** Propietario: Seguridad de la Información y Comité de cambios; Custodio: DBA.

### 4.2 Catálogo mínimo de datos (evidencias/04-catalogo.md)
Inventario unificado de activos en PostgreSQL 16 y MongoDB 7:

| ID | Conjunto de datos | Motor | Ubicación | Propietario | Custodio | Clasificación | Datos personales |
|---|---|---|---|---|---|---|---|
| **CAT-01** | Clientes | PostgreSQL 16 | postgres / comercial / public.clientes | Gerencia Comercial | DBA | Confidencial | Sí |
| **CAT-02** | Auditoría de clientes | PostgreSQL 16 | postgres / comercial / auditoria.cambios_clientes | Auditoría Interna / Seguridad | DBA | Restringida | Sí |
| **CAT-03** | Registro de cambios | PostgreSQL 16 | postgres / comercial / gobierno.solicitudes_cambio | Comité de cambios | DBA | Interna / Restringida | No |
| **CAT-04** | Clientes (tienda) | MongoDB 7 | mongo / comercial / clientes | Gerencia Comercial | DBA | Confidencial | Sí |
| **CAT-05** | Perfilado | MongoDB 7 | mongo / comercial / system.profile | Seguridad / Auditoría Interna | DBA | Restringida | Sí |


### 4.3 Diccionario de datos operativo (evidencias/03-diccionario.md y evidencias/diccionario-clientes.csv)
Los metadatos de public.clientes fueron incorporados directamente al catálogo del motor mediante instrucciones COMMENT ON TABLE y COMMENT ON COLUMN registradas en sql/02-comentarios-diccionario.sql. El diccionario clasifica como datos personales las columnas nombre, correo, telefono, rfc, edad y codigo_postal, vinculando cada campo con su finalidad operativa, mecanismo de enmascaramiento y regla de validación.

## 5. Conservación (A3)

De acuerdo con los criterios documentados en evidencias/05-conservacion.md bajo lineamientos de NIST SP 800-92:

* **Accesos de PostgreSQL y bitácora de mongod:** Conservación de 90 días en consulta rápida más 9 meses en archivo histórico en servidor centralizado de logs, con purga automatizada al vencer el año.
* **Cambios de privilegios, estructura e instantáneas de roles:** Conservación de 2 años en almacenamiento inmutable previo saneamiento de contraseñas en texto plano, plazo sujeto a confirmación final con el área jurídica.
* **Modificaciones de datos en log_statement = mod:** Conservación de 6 meses en repositorio externo aislado.
* **auditoria.cambios_clientes:** Conservación de 12 meses en línea; el plazo total histórico queda pendiente de confirmación con el área jurídica para armonizar obligaciones fiscales del SAT con derechos de cancelación ARCO establecidos en la LFPDPPP. Al cumplirse el plazo o ejercerse cancelación, se aplica anonimización irreversible sobre los atributos personales.
* **system.profile en MongoDB:** Retención operativa de 7 días dentro de la colección rotativa de 1 MB y 30 días en exportaciones puntuales de investigación.

## 6. Políticas (A4)

El marco normativo interno se compone de seis políticas operativas ubicadas en el directorio politicas/:

* **politicas/POL-01-acceso.md:** Exige aprobación escrita del Propietario del dato para otorgar permisos y revisión trimestral de privilegios. Se respalda con evidencias/E2-privilegios.txt, auditoria.instantaneas_privilegios y los registros GRANT/REVOKE de evidencias/E5-bitacora-postgresql.log, existiendo como brecha la falta de actas trimestrales firmadas.
* **politicas/POL-02-respaldo.md:** Establece respaldos diarios con verificación mensual de integridad y suma SHA-256, señalando que el procedimiento técnico se definirá en la Unidad V. Actualmente solo se cuenta con exportaciones manuales como evidencias/E5-bitacora-postgresql.log y evidencias/E5-bitacora-postgresql.sha256.
* **politicas/POL-03-retencion.md:** Fija plazos mínimos de 12 meses para registros de auditoría y 2 años para cambios de privilegios, ordenando anonimización al vencer. Se sustenta en evidencias/05-conservacion.md y evidencias/04-catalogo.md, con brecha en la automatización de purga.
* **politicas/POL-04-restauracion.md:** Prohíbe restauraciones o correcciones en producción sin autorización del Propietario y prohíbe desactivar disparadores durante recuperaciones, remitiendo el procedimiento técnico a la Unidad V. Se apoya en evidencias/E4-muestra-auditoria.txt y gobierno.solicitudes_cambio.
* **politicas/POL-05-datos-sensibles.md:** Limita el acceso directo a datos personales, exige vistas enmascaradas para soporte técnico y saneamiento de contraseñas en bitácoras. Se respalda en evidencias/diccionario-clientes.csv, evidencias/E3-disparadores.txt, evidencias/E4-muestra-auditoria.txt, evidencias/E5-bitacora-postgresql.log y evidencias/system-profile.json.
* **politicas/POL-06-cambios-produccion.md:** Regula las intervenciones antes, durante y después de operar en el ambiente de producción conforme a la definición de la Unidad I. Se acredita mediante el folio CAM-2026-014 en gobierno.solicitudes_cambio y la línea 216 de evidencias/E5-bitacora-postgresql.log.

## 7. Conciliación de cambios (A5)

El cruce entre las sentencias DDL y DCL registradas en evidencias/E5-bitacora-postgresql.log y la tabla gobierno.solicitudes_cambio, documentado en evidencias/06-conciliacion.md, arroja los siguientes resultados:

* **Cambios autorizados:** Una sentencia ALTER TABLE clientes ADD COLUMN canal_alta VARCHAR(20); en la línea 216 de evidencias/E5-bitacora-postgresql.log, respaldada por el folio CAM-2026-014 y ejecutada dentro de su ventana aprobada.
* **Cambios sin folio registrado:** Siete eventos previos carecen de autorización en gobierno.solicitudes_cambio. Las sentencias REVOKE UPDATE en línea 34, GRANT UPDATE en línea 35 y ALTER TABLE clientes ADD COLUMN segmento en línea 36 provienen de la configuración inicial de LAB-01 sin regularización retroactiva. La creación de rol_temporal en línea 37 carece de solicitud y expuso una contraseña en texto plano. Las sentencias sobre trg_auditoria_clientes en las líneas 163, 169 y 171 evidencian intentos y ejecuciones no autorizadas de desactivación del control de auditoría.
* **Hueco de trazabilidad:** La creación de la vista dba.bitacora no aparece en evidencias/E5-bitacora-postgresql.log porque se ejecutó cuando log_statement aún tenía valor none.

## 8. Hallazgos

| ID | Hallazgo | Fuente | Severidad | Impacto | Recomendación | Decisión requerida de |
|---|---|---|---|---|---|---|
| **H-01** | Desactivación temporal del disparador trg_auditoria_clientes por el superusuario postgres para ocultar modificaciones de datos. | evidencias/E5-bitacora-postgresql.log, líneas 169 y 171 | **Alta** | Pérdida de integridad probatoria de la tabla de auditoría y riesgo de fraude interno encubierto. | Reenviar bitácoras en tiempo real a un servidor externo inmutable fuera del alcance del DBA y activar alertas inmediatas ante cualquier instrucción DISABLE TRIGGER. | Seguridad de la Información y Auditoría Interna |
| **H-02** | Registro de contraseña en texto plano dentro de la bitácora del servidor al ejecutar CREATE ROLE rol_temporal. | evidencias/E5-bitacora-postgresql.log, línea 37 | **Alta** | Compromiso directo de credenciales administrativas ante lectura de logs e incumplimiento de POL-05. | Prohibir contraseñas literales en sentencias SQL empleando autenticación SCRAM o gestión externa de secretos, y restringir permisos de lectura sobre logs. | Seguridad de la Información y DBA |
| **H-03** | Privilegio directo SELECT del rol soporte_ana sobre la tabla base public.clientes en lugar de operar exclusivamente mediante vista enmascarada. | evidencias/E2-privilegios.txt, línea 4 | **Alta** | Exposición directa de RFC, teléfono y correo completo a personal de soporte técnico, contraviniendo POL-05. | Revocar SELECT sobre public.clientes a soporte_ana mediante folio aprobado y restringir su acceso a la vista enmascarada de la Unidad II. | Gerencia Comercial |
| **H-04** | Ejecución de cambios de privilegios, adición de columna segmento y creación de rol_temporal sin folio en gobierno.solicitudes_cambio. | evidencias/E5-bitacora-postgresql.log, líneas 34 a 37 | **Media** | Incumplimiento de POL-01 y POL-06 por ausencia de trazabilidad entre autorización de negocio y ejecución técnica. | Documentar folios de regularización para cambios vigentes y eliminar rol_temporal si concluyó su propósito operativo. | Comité de cambios y Gerencia Comercial |
| **H-05** | Defectos de calidad en public.clientes: correo duplicado en registros 1 y 7, RFC incompleto o nulo en registros 7 y 8, correo inválido y edad negativa en registro 8. | evidencias/01-calidad.md y sql/01-verificaciones-calidad.sql | **Media** | Errores en timbrado fiscal CFDI, duplicidad de expedientes comerciales y distorsión en reportes demográficos. | Solicitar depuración de datos al Propietario y aprobar la incorporación de restricciones UNIQUE y CHECK en el esquema operativo. | Gerencia Comercial y Facturación |
| **H-06** | Ausencia de respaldos programados automatizados y de procesos automáticos de anonimización o purga por vencimiento de retención. | politicas/POL-02-respaldo.md y politicas/POL-03-retencion.md | **Media** | Riesgo de pérdida de datos ante fallas de contenedor y riesgo de incumplimiento normativo por conservación indefinida de datos personales. | Implementar el esquema técnico de respaldos y tareas programadas de anonimización durante la Unidad V. | Gerencia Comercial, Área Jurídica y DBA |
| **H-07** | Hueco de registro inicial durante la creación de la vista dba.bitacora por encontrarse log_statement en none. | evidencias/E5-bitacora-postgresql.log y evidencias/06-conciliacion.md | **Baja** | Falta de evidencia en bitácora sobre la creación inicial de objetos administrativos del esquema dba. | Establecer log_statement = mod desde la plantilla inicial de aprovisionamiento de toda nueva instancia. | DBA y Seguridad de la Información |

## 9. Limitaciones conocidas y riesgos aceptados (A6)

Se distinguen las limitaciones verificadas técnicamente durante la ejecución de los laboratorios respecto de las funcionalidades documentadas que no fueron practicadas:

**1. Ausencia de auditoría de consultas de lectura en PostgreSQL (Verificado técnicamente en LAB-01 Parte B):**
    
* Limitación: La configuración nativa log_statement = mod y los disparadores DML únicamente registran escrituras; las consultas SELECT sobre columnas sensibles como rfc no dejan rastro.

* Capacidad documentada no practicada: La extensión pgaudit permite registrar lecturas a nivel de objeto y columna, pero no fue instalada en el contenedor del laboratorio.

* Aceptación formal requerida de: Seguridad de la Información y Gerencia Comercial.

**2. Carencia de subsistema nativo de auditoría en MongoDB Community Edition (Verificado técnicamente en LAB-02 y evidencias/09-comparacion.md):**
* Limitación: La edición Community de MongoDB 7 no dispone de auditoría nativa de eventos de seguridad, por lo que se empleó el perfilador system.profile limitado a 1 MB y sujeto a sobrescritura rápida, junto con instantáneas manuales de privilegios.

* Capacidad documentada no practicada: La edición MongoDB Enterprise Advanced incluye el módulo auditLog con filtrado granular de eventos y salida inmutable, no practicado por restricciones de licenciamiento.

* Aceptación formal requerida de: Gerencia de TI y Seguridad de la Información.

**3. Capacidades irrestrictas del superusuario sobre controles locales (Verificado técnicamente en LAB-01 Parte B):**
* Limitación: El rol postgres mantiene privilegios para ejecutar DISABLE TRIGGER o truncar tablas locales de auditoría mientras no exista segregación de infraestructura externa.

* Aceptación formal requerida de: Auditoría Interna y Dirección de TI.

**4. Volatilidad de registros en contenedores Docker sin almacenamiento externo (Verificado técnicamente en LAB-01 y LAB-02):**
* Limitación: La recreación de contenedores sin respaldo previo implica la pérdida de los logs locales del colector y de la memoria volátil de getLog en MongoDB.

* Aceptación formal requerida de: DBA y Gerencia de Infraestructura.

## 10. Índice de evidencias

| Ruta del archivo | Descripción | Integridad / Hash SHA-256 |
|---|---|---|
| EXPEDIENTE.md | Expediente oficial integrado de auditoría interna. | Documento principal |
| evidencias/E1-configuracion-registro.txt | Parámetros activos de registro en PostgreSQL 16 extraídos de pg_settings. | Verificable en motor |
| evidencias/E2-privilegios.txt | Matriz vigente de privilegios de roles sobre tablas en comercial. | Verificable en motor |
| evidencias/E3-disparadores.txt | Verificación de estado activo del disparador trg_auditoria_clientes. | Verificable en motor |
| evidencias/E4-muestra-auditoria.txt | Muestra anonimizada de metadatos de los últimos 10 eventos en auditoria.cambios_clientes. | Verificable en motor |
| evidencias/E5-bitacora-postgresql.log | Bitácora exportada de PostgreSQL 16 con contraseñas censuradas mediante <REDACTED>. | Ver E5-bitacora-postgresql.sha256 |
| evidencias/E5-bitacora-postgresql.sha256 | Suma de verificación SHA-256 correspondiente a E5-bitacora-postgresql.log. | b5a58792e8d08d7219fec3129b2c765ba5000b1d426003f7a53f16f11db49136 |
| evidencias/diccionario-clientes.csv | Diccionario operativo exportado desde information_schema.columns y col_description. | Verificable en motor |
| evidencias/system-profile.json | Exportación de registros del perfilador system.profile de MongoDB 7. | Ver system-profile.json.sha256 |
| evidencias/bitacora-mongod.log | Bitácora operativa exportada del servidor mongod en MongoDB 7. | Ver bitacora-mongod.log.sha256 |
| evidencias/09-comparacion.md | Comparativa técnica de mecanismos de auditoría entre PostgreSQL 16 y MongoDB 7. | Documento de referencia |
| evidencias/01-calidad.md | Análisis de hallazgos de calidad de datos en public.clientes. | Documento de evidencia |
| evidencias/02-responsables.md | Matriz ampliada de propietarios, custodios y usuarios autorizados. | Documento de evidencia |
| evidencias/03-diccionario.md | Diccionario extendido de gobierno, clasificación y reglas de calidad. | Documento de evidencia |
| evidencias/04-catalogo.md | Catálogo mínimo de activos de datos CAT-01 a CAT-05. | Documento de evidencia |
| evidencias/05-conservacion.md | Criterios de retención y disposición final basados en NIST SP 800-92. | Documento de evidencia |
| evidencias/06-conciliacion.md | Tabla de conciliación entre bitácora y folios de gobierno.solicitudes_cambio. | Documento de evidencia |
| sql/01-verificaciones-calidad.sql | Consultas de validación de calidad sobre public.clientes. | Script SQL reproducible |
| sql/02-comentarios-diccionario.sql | Definiciones COMMENT sobre tabla y columnas de public.clientes. | Script SQL reproducible |
| sql/03-inventario-tablas.sql | Consulta de inventario técnico de tablas en PostgreSQL. | Script SQL reproducible |
| sql/04-registro-cambios.sql | Creación de esquema gobierno, registro CAM-2026-014 y consulta de conciliación. | Script SQL reproducible |
| politicas/POL-01-acceso.md | Política de gestión de accesos y revisión de privilegios. | Política vigente |
| politicas/POL-02-respaldo.md | Política de respaldos y verificación de integridad. | Política vigente |
| politicas/POL-03-retencion.md | Política de retención y disposición final de datos y bitácoras. | Política vigente |
| politicas/POL-04-restauracion.md | Política de autorización y control de restauraciones. | Política vigente |
| politicas/POL-05-datos-sensibles.md | Política de protección y trazabilidad de datos sensibles. | Política vigente |
| politicas/POL-06-cambios-produccion.md | Política de control de cambios en el ambiente de producción. | Política vigente |

## Preguntas

**1. ¿Por qué el gobierno de datos no es “burocracia” en el contexto del problema inicial de la unidad?**

Porque resuelve un bloqueo operativo real, cuando Facturación detectó el RFC alterado de María García, nadie sabía qué valor era el correcto, quién tenía facultad para autorizar la corrección ni quién debía ejecutarla. El gobierno de datos define exactamente esa autoridad y trazabilidad para restaurar el servicio con certeza legal y fiscal, evitando parálisis operativas o correcciones arbitrarias.

**2. ¿Qué diferencia hay entre el propietario técnico de una tabla en PostgreSQL y el propietario del dato?**

* Propietario técnico (relowner, como postgres): Es una cuenta del motor de base de datos con privilegios administrativos para crear, alterar estructura, definir disparadores o dar mantenimiento físico al objeto.

* Propietario del dato (como Gerencia Comercial): Es un área o rol de negocio con autoridad organizacional para decidir la finalidad de la información, aprobar quién puede consultarla o modificarla y validar qué valor es legítimo ante un error o disputa.

**3. ¿Por qué una política sin evidencia no supera una auditoría?**

Porque en auditoría interna la existencia de un documento normativo solo demuestra intención de diseño, no cumplimiento operativo. Sin registros verificables bitácoras, folios de aprobación, muestras de auditoría o sumas criptográficas es imposible demostrar objetivamente que las reglas se aplican en la operación diaria.

**4. ¿Qué parte del expediente sería la más difícil de mantener actualizada? ¿Cómo lo resolverías?**

El catálogo de datos y el diccionario operativo (CAT-01 a CAT-05 y diccionario-clientes.csv), junto con la matriz de privilegios vigentes, ya que cambian cada vez que evoluciona el esquema, crece el volumen de registros o rotan los usuarios. Se resuelve automatizando su extracción en el flujo de cierre de cambios: exigir como requisito obligatorio de POL-06 ejecutar los scripts SQL de inventario y exportación CSV tras cada folio aprobado en gobierno.solicitudes_cambio y programar tareas periódicas de conciliación de permisos.

**5. ¿Qué hallazgo de tu expediente tiene mayor impacto y por qué?**

H-01, la desactivación temporal del disparador trg_auditoria_clientes por el superusuario postgres. Su impacto es el más alto porque invalida la confiabilidad probatoria de la tabla de auditoría del dato; demuestra que un administrador con privilegios totales puede alterar información fiscal o personal sin dejar huella en auditoria.cambios_clientes, abriendo la puerta a fraude interno encubierto si no existen bitácoras externas inmutables.

**6. ¿Por qué documentar una limitación es preferible a ocultarla ante una auditoría?**

Porque declarar explícitamente una limitación técnica como la falta de auditoría de lecturas SELECT sin pgaudit o la carencia de auditoría nativa en MongoDB Community permite a la dirección evaluar el riesgo residual, implementar controles compensatorios y aceptar formalmente el riesgo. Ocultarla convierte una restricción conocida de arquitectura en un hallazgo grave por falta de transparencia y control administrativo.