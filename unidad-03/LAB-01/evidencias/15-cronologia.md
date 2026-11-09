# Actividad 17 — Reconstruir la cronología y responder a Dirección

| # | Fecha y hora | Usuario | Cliente | Tipo de evento | Qué ocurrió | ¿Exitoso? | Fuente (línea o id_evento) |
|---|---|---|---|---|---|---|---|
| 1 | Sin evidencia | Desconocido | Desconocido | Datos | Cambio inicial de RFC (Actividad 3) | Sí | No hay evidencia (log_statement=none) |
| 2 | 2026-10-25 22:49:50 | postgres | [local] | Configuración | Se cambia log_statement a 'ddl' | Sí | Bitácora (línea parameter cambió a ddl) |
| 3 | 2026-10-25 22:50:00 | app_ventas | 127.0.0.1 | Acceso | Intento de conexión con contraseña incorrecta | No | Bitácora (línea FATAL) |
| 4 | 2026-10-25 22:50:00 | usuario_inexistente | 127.0.0.1 | Acceso | Intento de conexión con rol que no existe | No | Bitácora (línea FATAL) |
| 5 | 2026-10-25 22:50:09 | postgres | [local] | Privilegio / Estructura | GRANT UPDATE a app_ventas y ALTER TABLE clientes ADD COLUMN segmento | Sí | Bitácora (líneas statement:) |
| 6 | 2026-10-25 22:50:19 | postgres | [local] | Configuración | Se cambia log_statement a 'mod' | Sí | Bitácora (línea statement:) |
| 7 | 2026-10-25 22:50:20 | app_ventas | 127.0.0.1 | Datos | UPDATE clientes SET telefono = '6679990000' WHERE id = 3 | Sí | Bitácora (línea statement:) |
| 8 | 2026-10-25 22:50:25 | soporte_ana | 127.0.0.1 | Error | Intento de DELETE FROM clientes WHERE id = 5 (Permiso denegado) | No | Bitácora (línea ERROR: permission denied) |
| 9 | 2026-10-25 22:50:52 | app_ventas | 127.0.0.1 | Datos / Auditoría | UPDATE clientes SET rfc = 'GAMA780912ZZZ' WHERE id = 3 | Sí | Tabla auditoria.cambios_clientes (id_evento = 1) |
| 10 | 2026-10-25 22:51:00 | postgres | [local] | Manipulación / Datos | DISABLE TRIGGER, UPDATE rfc = 'GAMA780912GHI', ENABLE TRIGGER | Sí | Bitácora (líneas statement: DISABLE/UPDATE/ENABLE) |
1. ¿Quién cambió el RFC la primera vez (Actividad 3)? ¿Y en las Actividades 7, 12 y 14?

* Actividad 3: No hay evidencia. El motor estaba configurado con log_statement = none y aún no existía la tabla de auditoría, por lo que no se registró hora, usuario ni sentencia.

* Actividad 7: No hay evidencia en la bitácora ni en auditoría del usuario que ejecutó el UPDATE clientes SET rfc = 'GAMA780912XYZ', ya que la bitácora estaba en nivel ddl (que ignora modificaciones de datos) y el disparador no había sido creado.
Actividad 12: app_ventas (desde la IP 127.0.0.1 usando la aplicación app-ventas-web). Evidencia registrada en auditoria.cambios_clientes (id_evento = 1).

* Actividad 14: postgres (administrador desde la consola local [local]). No aparece en la tabla de auditoría porque desactivó el disparador, pero sí consta en la bitácora física del servidor.

2. ¿Quién cambió el teléfono?

app_ventas (desde la IP 127.0.0.1 usando app-ventas-web). Quedó asentado en la bitácora física del servidor tras cambiar el registro a nivel mod (LOG: statement: UPDATE clientes SET telefono = '6679990000' WHERE id = 3).

3. ¿Hubo intentos de acceso fallidos? ¿De qué usuarios y desde dónde?

Sí. Se registraron dos intentos fallidos en la bitácora física durante la Actividad 5: Usuario app_ventas desde la IP 127.0.0.1 (Fallo de contraseña).
Usuario usuario_inexistente desde la IP 127.0.0.1 (La cuenta no existe en el sistema).

4. ¿Qué valor tenía el RFC antes de cada cambio?

* Cambio de la Actividad 3: No hay evidencia (no existía ningún mecanismo de registro activo).

* Cambio de la Actividad 7: No hay evidencia del valor previo a 'GAMA780912XYZ' (la bitácora del servidor solo guarda la instrucción enviada, no el valor anterior del dato).

* Cambio de la Actividad 12: El valor anterior era GAMA780912XYZ (registrado con certeza en la columna valores_antes de auditoria.cambios_clientes).

* Cambio de la Actividad 14: No hay evidencia en la tabla de auditoría (el disparador fue bypass). Por la secuencia histórica se deduce que era GAMA780912ZZZ, pero el sistema de auditoría a nivel de datos no capturó la fotografía previa.

5. ¿Qué evidencia existe sobre las lecturas de datos sensibles y qué valor se puede restaurar con certeza?

* Lecturas: No hay evidencia en bitácora ni en auditoría de la lectura realizada por soporte_ana en la Actividad 15 (SELECT nombre, rfc...). Las consultas de lectura no activan disparadores y el nivel mod no registra sentencias SELECT.

* Restauración: Únicamente se puede restaurar con certeza técnica el RFC al valor GAMA780912XYZ (correspondiente al incidente de la Actividad 12), ya que es el único cambio que cuenta con el respaldo íntegro del estado anterior en la tabla auditoria.cambios_clientes.