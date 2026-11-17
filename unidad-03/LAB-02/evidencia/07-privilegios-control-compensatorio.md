# Actividad 7 — Cambios de privilegios: el límite más importante

**1. ¿Por qué un cambio de privilegios es uno de los eventos auditables más importantes?**

Porque una elevación no autorizada de roles rompe el principio de menor privilegio y permite acceder a datos confidenciales, alterar estructuras o desactivar controles de registro. Para cualquier esquema de seguridad y cumplimiento normativo, controlar quién modifica los permisos resulta esencial para preservar la integridad de toda la plataforma.

**2. ¿Con qué frecuencia tomarías instantáneas? ¿Qué factores influyen?**

* Frecuencia: Cada 15 a 60 minutos de manera automatizada en producción, además de capturas antes y después de cada ventana de mantenimiento programada.

* Factores: La criticidad de los datos almacenados, la frecuencia de cambios administrativos legítimos, los tiempos máximos de detección exigidos por auditoría y la política de retención de registros.

**3. ¿Quién debería poder escribir en auditoria.instantaneas_privilegios?**

Únicamente una cuenta de servicio automatizada con privilegio exclusivo de inserción sobre esa colección, sin permisos de actualización ni eliminación, evitando que usuarios de aplicación o administradores cotidianos alteren la evidencia histórica.

**4. Comunicación ejecutiva a Dirección**

MongoDB Community Edition no registra de forma nativa qué usuario otorga o revoca permisos ni el momento exacto en que ocurre un cambio de roles.
Como control compensatorio implementamos instantáneas periódicas automáticas de privilegios que permiten detectar qué permisos cambiaron entre dos cortes de tiempo, aunque sin atribuir la autoría individual.
Si la organización requiere trazabilidad completa con identificación exacta del responsable y cumplimiento normativo estricto sobre cambios de acceso, será necesario evaluar la adopción de MongoDB Enterprise o Atlas.