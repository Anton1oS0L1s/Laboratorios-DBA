POL-06 — Control de Cambios en el Ambiente de Producción


Objetivo:        Reducir fallas operativas, alteraciones estructurales no autorizadas y brechas de seguridad derivadas de intervenciones directas sin control en los sistemas productivos.

Alcance:         Aplica al ambiente de producción, entendido como el entorno operativo aislado que soporta las transacciones reales de Comercializadora Norte S.A. de C.V., separado de desarrollo y pruebas conforme a la definición de la Unidad I, en PostgreSQL 16 y MongoDB 7.

Regla:           Antes de intervenir producción, toda modificación de esquema, privilegios o parámetros requiere un folio aprobado por el Comité de cambios en gobierno.solicitudes_cambio con ventana definida y validación previa en pruebas. Durante la ventana autorizada, el DBA ejecuta únicamente las instrucciones aprobadas sin desactivar log_statement ni los disparadores de auditoría. Después de concluir, el DBA actualiza el diccionario o catálogo y Auditoría Interna concilia los eventos de la bitácora contra los folios aprobados.

Responsable:     Solicita: Área usuaria o Gerencia Comercial. Aprueba: Comité de cambios. Ejecuta: DBA. Concilia: Auditoría Interna.

Excepciones:     Intervenciones urgentes para contener incidentes críticos o vulnerabilidades activas; requieren autorización expedita de Seguridad de la Información y registro retroactivo en gobierno.solicitudes_cambio en un máximo de 24 horas.

Evidencia:       Folios aprobados en gobierno.solicitudes_cambio como el registro CAM-2026-014, sentencias DDL y DCL registradas en la línea 216 de evidencias/E5-bitacora-postgresql.log y actualización de metadatos en evidencias/diccionario-clientes.csv.

Revisión:        Semestral o inmediatamente después de detectar cambios sin folio en la conciliación mensual.