# Actividad 4 — Catálogo mínimo de datos (PostgreSQL y MongoDB)


## Inventario consolidado de activos de datos

| ID | Conjunto de datos | Motor | Ubicación | Propietario | Custodio | Clasificación | Contiene datos personales | Finalidad | Conservación | Diccionario |
|---|---|---|---|---|---|---|---|---|---|---|
| **CAT-01** | Clientes | PostgreSQL 16 | localhost:5432 / comercial / public.clientes | Gerencia Comercial | DBA | Confidencial | Sí | Gestión maestra de clientes, ventas y emisión de CFDI | Relación comercial activa + plazo legal fiscal (5 años) | diccionario-clientes.csv |
| **CAT-02** | Auditoría de clientes | PostgreSQL 16 | localhost:5432 / comercial / auditoria.cambios_clientes | Auditoría Interna / Seguridad de la Información | DBA | Restringida | Sí | Registro histórico de cambios (valores previos y posteriores) en clientes | 12 meses en línea + 4 años en archivo histórico (anonimizado tras baja ARCO) | Definición estructural en esquema auditoria (\d auditoria.cambios_clientes) |
| **CAT-03** | Registro de cambios | PostgreSQL 16 | localhost:5432 / comercial / gobierno.solicitudes_cambio | Comité de cambios | DBA | Interna / Restringida | No | Control documental de solicitudes, aprobaciones y ventanas de cambio (POL-06) | 3 años para auditorías internas y revisiones de cumplimiento | Definición estructural en esquema gobierno (\d gobierno.solicitudes_cambio) |
| **CAT-04** | Clientes (tienda) | MongoDB 7 | localhost:27017 / comercial / clientes | Gerencia Comercial | DBA | Confidencial | Sí | Operación de catálogo de clientes en canal digital / tienda | Relación comercial activa (sincronizada con CAT-01) | Esquema documental de colección clientes |
| **CAT-05** | Perfilado | MongoDB 7 | localhost:27017 / comercial / system.profile | Seguridad de la Información / Auditoría Interna | DBA | Restringida | Sí | Telemetría de rendimiento y detección de consultas anómalas en MongoDB | 7 días en colección capped rotativa (30 días en exportaciones) | Estructura nativa system.profile (MongoDB 7) |

---

**1. ¿Por qué CAT-02 y CAT-05 contienen datos personales aunque su propósito sea la auditoría?**  

   Porque ambos mecanismos capturan el contenido real de las transacciones ejecutadas sobre entidades de negocio. En **CAT-02**, el disparador serializa la fila completa antes y después de cada modificación en columnas JSONB (valores_antes y valores_despues), preservando RFC, nombre y correo; en **CAT-05**, el perfilador de MongoDB guarda las consultas completas, incluyendo filtros de búsqueda y documentos enviados en operaciones de lectura o actualización.


**2. ¿Qué pasa si CAT-01 y CAT-04 tienen propietarios distintos y el RFC de un cliente difiere entre ambos motores?**

   Se produce una fragmentación de autoridad sobre el dato maestro, porque al no existir un único responsable designado para determinar cuál registro representa la verdad oficial del negocio, cada propietario puede defender la validez de su propio sistema, bloqueando la conciliación de datos, retrasando la corrección fiscal y generando errores recurrentes en facturación o atención al cliente.


**3. ¿Qué información del catálogo cambia con más frecuencia y quién debe actualizarla?**  

   Los atributos técnicos y operativos del inventario, tales como el volumen de registros, el tamaño en disco, las referencias al diccionario actualizado tras agregar columnas (por ejemplo, canal_alta) y el estado de los controles aplicados. La actualización recae en el Custodio como parte del cierre de cada cambio aprobado en producción, bajo validación del Propietario cuando se modifiquen la finalidad, el nivel de clasificación o los criterios de retención.