POL-03 — Retención, Archivo y Disposición Final de Datos y Bitácoras

Objetivo:        Evitar sanciones legales por conservar datos personales más allá de su finalidad y garantizar disponibilidad suficiente de bitácoras para investigaciones de seguridad.

Alcance:         Aplica a los activos inventariados en el catálogo CAT-01 a CAT-05 y a los registros de actividad de PostgreSQL 16 y MongoDB 7 en producción.

Regla:           Los datos maestros de clientes permanecen activos mientras dure la relación comercial más el periodo fiscal obligatorio, plazo a confirmar con el área jurídica respecto a disposiciones del SAT. Las bitácoras de seguridad y los registros de auditoria.cambios_clientes se retienen un mínimo de 12 meses en línea y 2 años en archivo histórico para respaldar las investigaciones de POL-05; cumplido el plazo o ante una solicitud de cancelación ARCO, los atributos personales en auditoría se anonimizan de forma irreversible.

Responsable:     Establece plazos y autoriza disposición: Propietario del dato con validación jurídica. Ejecuta: DBA.

Excepciones:     Retención extendida por litigios en curso o investigaciones activas de Auditoría Interna, autorizada por el área jurídica o Auditoría Interna.

Evidencia:       Matriz de criterios de conservación en evidencias/05-conservacion.md y catálogo mínimo en evidencias/04-catalogo.md. Hoy no existe un proceso automatizado de anonimización ni actas de destrucción ejecutadas.

Revisión:        Anual o ante modificaciones en el marco legal de protección de datos personales.