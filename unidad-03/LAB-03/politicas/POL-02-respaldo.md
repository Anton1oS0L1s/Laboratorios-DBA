POL-02 — Respaldo de Bases de Datos y Evidencias de Auditoría


Objetivo:        Prevenir la pérdida definitiva de información operativa, metadatos de gobierno o registros históricos ante fallas de infraestructura o incidentes de seguridad.

Alcance:         Aplica a la base operativa comercial en PostgreSQL 16 y MongoDB 7, y a las bitácoras exportadas en producción.

Regla:           El DBA genera respaldos completos diarios de las bases productivas y de los esquemas de auditoría y gobierno, almacenando una copia aislada fuera del servidor origen con suma de verificación SHA-256. Mensualmente, el DBA valida la integridad y legibilidad de una muestra de copias para certificar su utilidad. El procedimiento técnico se definirá en la Unidad V.

Responsable:     Define frecuencia y alcance: Gerencia Comercial y Seguridad de la Información. Ejecuta y certifica: DBA.

Excepciones:     Reprogramación temporal de la ventana de respaldo por mantenimientos mayores en producción, autorizada por el Comité de cambios y asentada en gobierno.solicitudes_cambio.

Evidencia:       Hoy no existe evidencia técnica de respaldos programados ni bitácoras de pruebas de verificación; actualmente solo existen exportaciones puntuales como evidencias/E5-bitacora-postgresql.log y evidencias/E5-bitacora-postgresql.sha256.

Revisión:        Anual o al incorporar nuevos conjuntos de datos al catálogo mínimo.