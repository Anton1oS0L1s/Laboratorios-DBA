# Actividad 10 — Responder a Dirección

**1. ¿Quién cambió el RFC de María García en la Actividad 2? ¿Y en la Actividad 3?**

* En la Actividad 2: No hay evidencia con esta edición. El motivo técnico es que el perfilador estaba apagado en nivel 0 y MongoDB Community Edition carece de auditoría nativa para operaciones de modificación de datos. La bitácora del servidor en las categorías NETWORK y ACCESS únicamente demuestra que el usuario app_ventas se conectó y autenticó, pero no vincula esa sesión con la ejecución de la actualización sobre el documento de María García.

* En la Actividad 3: El cambio fue ejecutado por el usuario app_ventas@comercial desde la dirección local 127.0.0.1. Al encontrarse activo el perfilador en nivel 2, la colección system.profile registró directamente la operación update sobre el cliente con identificador 3 asignando el nuevo valor GAMA780912XYZ al campo rfc y atribuyendo la acción a dicha cuenta autenticada.

**2. ¿Cuándo y desde qué aplicación?**

* En la Actividad 2: No hay evidencia con esta edición sobre el momento exacto en que se modificó el registro. El motivo técnico es que, al estar deshabilitado el perfilador, el motor no guardó la instrucción de escritura; la bitácora solo conserva la hora de inicio de sesión desde la aplicación app-ventas-web, sin confirmar el instante de la alteración del dato.

* En la Actividad 3: La actualización se ejecutó en la marca de tiempo ts registrada en el documento de system.profile correspondiente a la operación update de la Actividad 3, y provino de la aplicación identificada como app-ventas-web mediante el parámetro appName de la conexión.

**3. ¿Qué valor tenía antes?**

Tanto en la Actividad 2 como en la Actividad 3: No hay evidencia con esta edición. El motivo técnico es que MongoDB Community Edition no conserva imágenes previas ni respaldos anteriores de los documentos antes de ser modificados o eliminados. Incluso con el perfilador encendido en nivel 2 durante la Actividad 3, system.profile almacena únicamente la instrucción enviada con el criterio de búsqueda y el nuevo valor asignado mediante el operador set, sin guardar el contenido previo del campo rfc.

**4. ¿Cambió alguien los privilegios de app_ventas?**

* Respecto a quién ejecutó el cambio y cuándo ocurrió exactamente:

    No hay evidencia con esta edición. El motivo técnico es que MongoDB Community Edition no registra comandos administrativos de asignación o revocación de roles como grantRolesToUser ni revokeRolesFromUser en la bitácora del servidor ni en la colección system.profile, incluso con el perfilador configurado en nivel 2.

* Respecto a la detección mediante control compensatorio:
    
    A través de las instantáneas periódicas almacenadas en la colección auditoria.instantaneas_privilegios durante la Actividad 7, sí se comprobó que entre la primera y la segunda captura se agregó temporalmente el rol dbAdmin sobre la base comercial al usuario app_ventas y posteriormente fue revocado, aunque dicho mecanismo no permite identificar qué administrador realizó la modificación ni el instante preciso del cambio.