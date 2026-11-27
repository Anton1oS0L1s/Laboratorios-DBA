# Actividad 2 — Matriz de propietarios, custodios y usuarios


## Ampliación de la matriz de responsabilidades


| Conjunto de datos | Propietario | Custodio | Usuarios autorizados | Quién aprueba accesos | Quién aprueba correcciones |
|---|---|---|---|---|---|
| comercial.public.clientes (PostgreSQL) | Gerencia Comercial | DBA | Servicio de ventas (app_ventas), Facturación, Soporte Técnico | Gerencia Comercial | Gerencia Comercial / Facturación |
| auditoria.cambios_clientes (PostgreSQL) | Auditoría Interna / Seguridad de la Información | DBA (operación de infraestructura, sin permisos DML) | Auditores internos (solo lectura), Disparador (SECURITY DEFINER) | Auditoría Interna / Seguridad de la Información | No aplica (bitácora inmutable; no admite edición ni borrado) |
| Bitácora de PostgreSQL | Seguridad de la Información / Auditoría Interna | DBA / Administrador de Sistemas | Auditores internos, Seguridad de la Información, DBA (diagnóstico) | Seguridad de la Información / Auditoría Interna | No aplica (registro histórico de solo lectura) |
| comercial.clientes (MongoDB) | Gerencia Comercial | DBA | Aplicación de tienda / servicios de consulta operativa | Gerencia Comercial | Gerencia Comercial |
| comercial.system.profile (MongoDB) | Seguridad de la Información / Auditoría Interna | DBA | Auditores internos, DBA (análisis de rendimiento) | Seguridad de la Información / Auditoría Interna | No aplica (telemetría operativa de solo lectura) |
---

**1. ¿Por qué el propietario de auditoria.cambios_clientes no debería ser el mismo que opera clientes?**  
   Para garantizar la segregación de funciones e independencia de la evidencia. Si el área operativa o el dueño de negocio de clientes controlara también la tabla de auditoría, tendría facultades para autorizar la depuración de registros históricos o modificar qué eventos se capturan, invalidando la confiabilidad del rastro ante una investigación interna o disputa fiscal.


**2. ¿Quién debería poder leer las bitácoras y la vista dba.bitacora? Relaciónalo con lo observado en el LAB-01 (secretos en la bitácora).**  

   El acceso de lectura debe restringirse exclusivamente a Auditoría Interna, Seguridad de la Información y el DBA. En el LAB-01 se comprobó que la bitácora del servidor captura sentencias completas que incluyen información confidencial (datos personales en INSERT/UPDATE) e incluso contraseñas en texto plano durante la gestión de roles (CREATE/ALTER ROLE ... PASSWORD); conceder acceso a desarrolladores o usuarios operativos expondría credenciales críticas del motor.


**3. ¿Qué ocurre con la responsabilidad sobre un dato cuando nadie la tiene asignada? Relaciónalo con el problema inicial de la unidad.**  

   Se genera orfandad de gobierno, ya que ningún área valida la exactitud de la información, nadie asume la autoridad para autorizar cambios y los incidentes quedan sin resolución formal. En el caso del RFC alterado de María García, si no existe un propietario designado, el área de Facturación no puede emitir comprobantes válidos ni ordenar una restauración, mientras que el DBA queda impedido de modificar el registro por no tener autoridad de negocio para certificar cuál es el dato correcto.