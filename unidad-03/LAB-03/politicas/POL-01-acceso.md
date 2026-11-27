POL-01 — Gestión de Accesos y Revisión Periódica de Privilegios


Objetivo:        Evitar la asignación de permisos excesivos, cuentas huérfanas y accesos no justificados a tablas operativas o registros de auditoría.

Alcance:         Cubre todas las cuentas humanas y de servicio en las instancias PostgreSQL 16 y MongoDB 7 en desarrollo, pruebas y producción.

Regla:           Únicamente los responsables de área o líderes de proyecto pueden solicitar altas o modificaciones de permisos, las cuales requieren autorización escrita del Propietario del dato antes de que el DBA las aplique. Auditoría Interna y el DBA ejecutan una conciliación trimestral entre los privilegios vigentes y las solicitudes aprobadas.

Responsable:     Aprueba: Propietario del dato. Ejecuta: DBA. Audita: Auditoría Interna.

Excepciones:     Habilitación de accesos temporales ante caídas críticas del servicio productivo; requiere visto bueno de Seguridad de la Información y revocación antes de 24 horas.

Evidencia:       Consultas de privilegios vigentes en evidencias/E2-privilegios.txt, instantáneas de roles en auditoria.instantaneas_privilegios y registros statement: GRANT/REVOKE en dba.bitacora. Hoy no existe un acta formal firmada de revisión trimestral.

Revisión:        Semestral o tras reestructuraciones de personal en áreas críticas.