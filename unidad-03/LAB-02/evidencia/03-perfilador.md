# Actividad 3 — Activar el perfilador y registrar operaciones

| # | op | Usuario | Cliente | Aplicación | Momento | Qué hizo | Documentos afectados |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | query | app_ventas@comercial | 127.0.0.1 | app-ventas-web | Pega aquí tu ts 1 | Consultó clientes filtrando por ciudad igual a Culiacán y proyectando nombre y ciudad | 5 examinados y 3 devueltos |
| 2 | update | app_ventas@comercial | 127.0.0.1 | app-ventas-web | Pega aquí tu ts 2 | Actualizó el campo rfc a GAMA780912XYZ en el cliente con identificador 3 | 1 examinado y 1 modificado |
| 3 | remove | app_ventas@comercial | 127.0.0.1 | app-ventas-web | Pega aquí tu ts 3 | Eliminó el documento del cliente con identificador 2 | 1 examinado y 1 eliminado |

---

**1. ¿Puedes saber cuál era el RFC antes del cambio con la información de system.profile?**

No es posible saberlo. El perfilador registra únicamente la instrucción enviada y el nuevo valor asignado en la actualización, sin almacenar imágenes previas de los documentos modificados.

**2. ¿Puedes saber qué datos tenía el documento eliminado?**

No es posible saberlo. El documento en system.profile solo conserva el filtro de búsqueda utilizado para borrar el registro y el contador de documentos eliminados, sin respaldar los campos que contenía el cliente.

**3. A diferencia de registrar solo modificaciones en PostgreSQL, el nivel 2 sí registró la consulta. ¿Qué ventaja y qué riesgo tiene eso?**

* Ventaja: Permite rastrear lecturas sobre datos sensibles, detectar intentos de extracción masiva de información y diagnosticar consultas ineficientes.

* Riesgo: Incrementa la carga de escritura del servidor, llena rápidamente el espacio circular de 1 MB de system.profile borrando evidencia reciente y expone datos personales incluidos en los criterios de búsqueda.

**4. ¿Por qué el campo user incluye @comercial?**

Porque en MongoDB las cuentas de usuario están vinculadas a la base de datos donde fueron creadas y autenticadas. El sufijo @comercial identifica la base de datos de autenticación del usuario app_ventas para evitar ambigüedades entre cuentas de distintas bases.