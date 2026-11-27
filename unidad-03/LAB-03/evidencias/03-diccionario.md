# Actividad 3 — Diccionario de datos operativo (public.clientes)


## Diccionario extendido de gobierno y control


| Columna | Clasificación (Unidad II) | Finalidad | Control aplicado | ¿Cambios auditados? | Regla de calidad |
|---|---|---|---|---|---|
| id | Interna / Técnica | Identificación unívoca del registro en el sistema | Llave primaria (PRIMARY KEY) y secuencia automática | Sí (auditoria.cambios_clientes) | Unicidad absoluta, NOT NULL |
| nombre | Dato personal | Identificación nominativa y emisión de documentos | Acceso restringido por rol; enmascaramiento parcial en vistas | Sí (auditoria.cambios_clientes) | Obligatorio (NOT NULL), sin caracteres de control |
| correo | Dato personal | Envío de notificaciones y comprobantes electrónicos | Vista enmascarada para soporte (U2) | Sí (auditoria.cambios_clientes) | Unicidad normalizada (lower), estructura válida usuario@dominio |
| telefono | Dato personal | Contacto directo para soporte y entregas | Vista enmascarada para soporte (U2) | Sí (auditoria.cambios_clientes) | Cadena numérica de 10 dígitos |
| rfc | Dato personal (fiscal) | Facturación electrónica (CFDI) | Vista enmascarada para soporte (U2) | Sí, LAB-01 Parte B (auditoria.cambios_clientes) | Formato SAT (12 caracteres moral / 13 física) |
| edad | Dato personal | Segmentación demográfica y analítica agregada | Lectura limitada a roles autorizados | Sí (auditoria.cambios_clientes) | Rango numérico válido entre 18 y 120 años |
| ciudad | Pública / Demográfica | Planificación logística y cobertura territorial | Escritura controlada mediante aplicación (app_ventas) | Sí (auditoria.cambios_clientes) | Estandarización ortográfica y catálogo de localidades |
| codigo_postal | Dato personal / Fiscal | Validación de domicilio fiscal para facturación | Escritura controlada mediante aplicación (app_ventas) | Sí (auditoria.cambios_clientes) | Exactamente 5 dígitos numéricos |
| fecha_alta | Interna / Operativa | Control de antigüedad y auditoría de creación | Asignación automática (DEFAULT now()) | Sí (auditoria.cambios_clientes) | Marca temporal válida, NOT NULL |
| segmento | Interna / Comercial | Definición de listas de precios y políticas comerciales | Modificación restringida a roles administrativos/comerciales | Sí (auditoria.cambios_clientes) | Pertenencia a catálogo cerrado de segmentos |

---

**1. ¿Qué ventaja tiene guardar el significado en COMMENT en lugar de solo en un documento aparte?**  
   Vincula directamente la semántica de negocio con la estructura física dentro del catálogo interno de PostgreSQL (pg_description). De este modo, el diccionario evoluciona junto con las tablas, evita la desactualización típica de hojas de cálculo externas y permite extraer reportes unificados (metadatos técnicos + definición funcional) mediante consultas SQL reproducibles.


**2. ¿Quedaron registrados los COMMENT en la bitácora? ¿Con qué nivel de log_statement?**  

   No quedaron registrados bajo la configuración vigente (log_statement = 'mod'), puesto que dicho nivel únicamente captura operaciones de manipulación de filas (INSERT, UPDATE, DELETE, TRUNCATE, COPY FROM). Debido a que COMMENT ON es una instrucción de definición de metadatos (DDL), requiere configurar log_statement = 'ddl' o 'all' para dejar rastro en la bitácora del servidor.


**3. ¿Qué información del diccionario debe mantenerse fuera del motor? ¿Por qué?**  

   Deben resguardarse fuera de los metadatos del SGBD los mapas de riesgo detallado, excepciones de seguridad aprobadas, ubicaciones físicas de respaldos o servidores de logs y criterios específicos de detección antifraude. Si un actor malicioso obtiene acceso de consulta al catálogo del sistema (pg_catalog), exponer esa información interna le proporcionaría inteligencia arquitectónica para evadir controles o comprometer activos externos.