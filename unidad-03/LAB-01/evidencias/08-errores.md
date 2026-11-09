# Actividad 8 — Errores y operaciones rechazadas

1. ¿El intento de soporte_ana causó algún daño? ¿Por qué debe auditarse de todos modos?

No, no causó ningún daño porque la base de datos bloqueó el comando antes de alterar los registros. Debe auditarse porque permite identificar cuando un usuario está intentando rebasar sus funciones o probar suerte con operaciones prohibidas, además de servir como prueba de que las reglas de seguridad sí están deteniendo los accesos no autorizados.   

2. ¿Qué diferencia hay entre un error de autorización (esta actividad) y uno de autenticación (Actividad 5)?

La autenticación valida si puedes entrar al sistema (quién eres) y, si falla la contraseña, corta la conexión de inmediato. La autorización revisa qué tienes permitido hacer una vez adentro (qué permisos tienes); si no tienes permiso para un comando, el sistema cancela la instrucción, pero te deja permanecer dentro de la sesión.   

3. ¿Qué indica el error de DROP ROLE sobre el orden correcto para dar de baja a un usuario?

Indica que no se puede eliminar a un usuario de golpe si todavía tiene permisos asignados o es dueño de algún objeto. El orden correcto requiere primero revocar todos sus accesos (con REVOKE) o quitarle la propiedad de las tablas antes de borrar la cuenta del sistema.