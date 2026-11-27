# Actividad 9 — Comparar los tres escenarios

| Evento auditable | PostgreSQL con bitácora y disparador | MongoDB Community con perfilador y bitácora | MongoDB Enterprise o Atlas con auditoría nativa |
| :--- | :--- | :--- | :--- |
| Acceso exitoso | Sí observado | Sí observado | Documentado, no practicado |
| Acceso fallido | Sí observado | Sí observado | Documentado, no practicado |
| Cambio de privilegios | Sí observado | Parcial: no existe registro nativo en la bitácora ni en system.profile; solo se detecta mediante instantáneas periódicas que muestran qué roles cambiaron entre dos cortes, pero no quién ejecutó el cambio ni el momento exacto | Documentado, no practicado |
| Cambio de estructura | Sí observado | Parcial: el perfilador en nivel 2 captura comandos de creación o borrado de colecciones e índices mientras esté encendido y no se sobrescriba su límite circular de 1 MB, pero no queda en la bitácora permanente | Documentado, no practicado |
| Modificación de datos | Sí observado | Parcial: el perfilador registra insert, update y remove con usuario, aplicación y filtro cuando está activo, pero depende de configuración volátil y de exportación antes de que el límite de 1 MB los sobrescriba | Documentado, no practicado |
| Valor anterior del dato | Sí observado | No | Documentado, no practicado: la auditoría nativa registra la instrucción y parámetros enviados, sin guardar copias previas completas de los documentos |
| Lectura de datos sensibles | Parcial: los disparadores no cubren consultas SELECT y log_statement en modo mod las omite; requiere activar log_statement en modo all o usar extensiones como pgaudit con alto costo de volumen | Parcial: el perfilador en nivel 2 registra consultas find con su filtro y usuario, pero se pierde al aplicar filtros de solo escritura y expone datos personales en texto claro | Documentado, no practicado |
| Cambio de configuración del registro | Parcial: los cambios mediante comandos como ALTER SYSTEM se registran si se auditan comandos administrativos, pero ediciones directas en postgresql.conf requieren control en el sistema operativo | Sí observado | Documentado, no practicado |

---

**Compara E2 con la matriz de roles de la Unidad II. ¿Coinciden? Si no, ¿es un hallazgo?**

No coinciden y constituye un hallazgo de seguridad. En la matriz de la Unidad II, el rol soporte_ana tiene restringido el acceso directo a la tabla base y debe consultar únicamente una vista enmascarada; sin embargo, E2 muestra que conserva el privilegio SELECT directo sobre public.clientes, exponiendo RFC, teléfonos y correos completos. Asimismo, los permisos vigentes de app_ventas reflejan alteraciones previas ejecutadas en el LAB-01 sin folio de aprobación en gobierno.solicitudes_cambio.

**¿Por qué E4 muestra solo metadatos y no valores_antes ni valores_despues?**

Para cumplir con el principio de minimización de datos y confidencialidad de POL-05. Las columnas valores_antes y valores_despues contienen los registros íntegros en formato JSONB; incluirlos en un archivo de evidencia portable expondría datos personales y fiscales fuera del motor. Los metadatos extraídos bastan para probar técnicamente que el disparador opera y registra eventos sin comprometer la privacidad de los titulares.

**¿Qué evidencia demostraría que E1 estuvo vigente durante todo el periodo revisado y no solo hoy?**

La consulta a pg_settings únicamente acredita la configuración activa en el instante de la extracción. Para demostrar continuidad en todo el periodo se requiere:
Continuidad cronológica en E5-bitacora-postgresql.log, comprobando registros ininterrumpidos de conexiones, desconexiones y sentencias de modificación desde el inicio hasta el cierre del periodo, sin huecos ni sentencias ALTER SYSTEM o recargas de configuración no autorizadas.
Bitácora de control de cambios sobre archivos de configuración, respaldada por folios aprobados en gobierno.solicitudes_cambio y sumas de verificación SHA-256 periódicas sobre postgresql.conf y postgresql.auto.conf.