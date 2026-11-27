POL-04 — Autorización y Control de Restauraciones de Datos

Objetivo:        Impedir la sobrescritura accidental de información vigente, la pérdida de consistencia referencial o la alteración encubierta durante tareas de recuperación.

Alcance:         Aplica a cualquier recuperación total de base de datos o reversión puntual de registros en PostgreSQL 16 y MongoDB 7 dentro del ambiente de producción.

Regla:           Ninguna restauración completa o actualización correctiva de datos en producción puede iniciarse sin autorización formal del Propietario del dato afectado y sin verificación previa en un entorno aislado de pruebas. Toda corrección puntual debe ejecutarse mediante sentencias auditadas manteniendo activos los disparadores de trazabilidad. El procedimiento técnico se definirá en la Unidad V.

Responsable:     Autoriza: Propietario del dato y Comité de cambios en restauraciones totales. Ejecuta: DBA.

Excepciones:     Restauración de emergencia por indisponibilidad total del servidor productivo; requiere autorización verbal inmediata de la Gerencia de TI y Seguridad, y registro documental dentro de las 12 horas posteriores.

Evidencia:       Registros previos en auditoria.cambios_clientes documentados en evidencias/E4-muestra-auditoria.txt, folios aprobados en gobierno.solicitudes_cambio y líneas de ejecución en dba.bitacora. Hoy no existe evidencia de simulacros de restauración completa.

Revisión:        Anual y después de cada evento de recuperación ejecutado en producción.