POL-05 — Protección, Acceso y Trazabilidad de Datos Sensibles


Objetivo:        Mitigar el riesgo de filtración, consulta indebida o exposición no autorizada de datos personales identificadores y fiscales y credenciales.

Alcance:         Cubre todas las columnas clasificadas como dato personal o confidencial en public.clientes, auditoria.cambios_clientes, comercial.clientes y los archivos de bitácora exportados.

Regla:           Solo los roles operativos expresamente autorizados por la Gerencia Comercial pueden consultar datos personales sin enmascarar en producción, mientras que soporte técnico debe utilizar exclusivamente vistas enmascaradas y los entornos de desarrollo o pruebas deben operar con datos anonimizados. Cada modificación sobre datos personales en clientes queda registrada con valores antes y después, y toda bitácora exportada debe sanearse para eliminar contraseñas en texto plano antes de compartirse.

Responsable:     Autoriza uso y finalidad: Gerencia Comercial. Implementa enmascaramiento y auditoría: DBA y Seguridad de la Información.

Excepciones:     Acceso temporal a datos reales en producción para diagnóstico de fallas críticas, autorizado por Seguridad de la Información y Gerencia Comercial, con eliminación segura de cualquier archivo temporal al finalizar.

Evidencia:       Disparador activo trg_auditoria_clientes en evidencias/E3-disparadores.txt, registros de cambio en evidencias/E4-muestra-auditoria.txt, diccionario de clasificación en evidencias/diccionario-clientes.csv, bitácora saneada en evidencias/E5-bitacora-postgresql.log y perfilador en evidencias/system-profile.json. Hoy no existe auditoría de lecturas SELECT en PostgreSQL por falta de pgaudit.

Revisión:        Semestral o cada vez que se incorporen nuevos campos con datos personales al diccionario.