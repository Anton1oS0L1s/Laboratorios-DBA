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