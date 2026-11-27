# Actividad 7 — Registro de cambios y conciliación


## Tabla de conciliación


| Momento (bitácora) | Usuario | Sentencia | Folio que lo autoriza | ¿Autorizado? | Hallazgo |
|---|---|---|---|---|---|
| 2026-10-25 22:54:26.533 | postgres | ALTER TABLE clientes ADD COLUMN canal_alta VARCHAR(20); | CAM-2026-014 | Sí | — |
| 2026-10-25 22:50:53.549 | postgres | ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes | Ninguno | No | **Hallazgo crítico:** Suspensión deliberada del disparador de auditoría por el superusuario para ocultar modificaciones de datos. |
| 2026-10-25 22:50:53.554 | postgres | ALTER TABLE clientes ENABLE TRIGGER trg_auditoria_clientes | Ninguno | No | **Hallazgo crítico:** Reactivación del disparador posterior a la alteración no auditada de un registro. |
| 2026-10-25 22:50:53.460 | app_ventas | ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes | Ninguno | No | **Hallazgo alto:** Intento fallido de evasión de controles por cuenta de aplicación; bloqueado por falta de propiedad sobre la tabla. |
| 2026-10-25 22:50:09.367 | postgres | GRANT UPDATE ON clientes TO app_ventas | Ninguno | No | **Hallazgo medio:** Asignación de privilegios ejecutada durante la configuración inicial de LAB-01 sin folio registrado en gobierno.solicitudes_cambio. |
| 2026-10-25 22:50:09.341 | postgres | REVOKE UPDATE ON clientes FROM soporte_ana | Ninguno | No | **Hallazgo medio:** Revocación de privilegios ejecutada durante la configuración inicial de LAB-01 sin respaldo documental de solicitud. |
| 2026-10-25 22:50:09.372 | postgres | ALTER TABLE clientes ADD COLUMN segmento VARCHAR(20) | Ninguno | No | **Hallazgo medio:** Modificación de estructura realizada durante la preparación de LAB-01 sin aprobación formal registrada. |
| 2026-10-25 22:50:09.375 | postgres | CREATE ROLE rol_temporal LOGIN PASSWORD '<REDACTED>' | Ninguno | No | **Hallazgo alto:** Creación de cuenta sin solicitud aprobada, sin vigencia de baja y con exposición de contraseña en texto plano en la bitácora original. |

Nota de auditoría: La creación de la vista dba.bitacora no figura en los registros extraídos porque se ejecutó cuando log_statement estaba configurado en none, lo cual constituye un hueco de evidencia declarado.

---

**1. ¿Qué cambios de la bitácora no tienen folio? Clasifícalos: ¿son de preparación del laboratorio o representan hallazgos?**  
   
Carecen de folio las sentencias de las líneas 34, 35, 36, 37, 163, 169 y 171. Desde una perspectiva formal de auditoría, todos constituyen hallazgos divididos en dos grupos:

* **Hallazgos administrativos de despliegue previo:** Las sentencias REVOKE UPDATE, GRANT UPDATE y ALTER TABLE clientes ADD COLUMN segmento corresponden a la configuración técnica inicial del LAB-01 ejecutada antes de implementar la tabla de gobierno, pero representan brechas documentales al no contar con regularización retroactiva.
* **Hallazgos de seguridad y evasión:** La creación de rol_temporal con contraseña visible y las manipulaciones sobre trg_auditoria_clientes son incidentes graves de seguridad que demuestran creación de accesos no gobernados e intentos de eludir controles de trazabilidad.

**2. La desactivación del disparador del LAB-01 (Actividad 14), ¿qué tan grave es como hallazgo? ¿Por qué? ¿Qué distingue la línea 163 de la 169?**  

* **Gravedad:** Se clasifica como un hallazgo de severidad Alta / Crítica.
* **Justificación:** Anula deliberadamente el control compensatorio que registra el historial de valores antes y después de cada modificación, permitiendo alterar registros sensibles sin dejar rastro en auditoria.cambios_clientes y comprometiendo la integridad probatoria de toda la base de datos.
* **Distinción entre líneas:** La línea 163 registra un intento fallido por parte del usuario app_ventas, rechazado por el motor al no ser propietario de la tabla clientes. La línea 169 registra la ejecución exitosa por parte del superusuario postgres, quien sí posee privilegios para deshabilitar el disparador.

**3. ¿Qué limitación tiene esta conciliación si log_statement estuvo en none durante algún periodo?**  

   Se genera un punto ciego absoluto sobre ese intervalo temporal. Cualquier sentencia DDL o DCL ejecutada mientras log_statement valía none no queda asentada en los archivos del colector, impidiendo verificar si se crearon roles ocultos, se otorgaron privilegios o se alteraron estructuras antes de activar el registro.


**4. ¿Quién debería realizar la conciliación: el DBA que hizo los cambios u otra persona?**  
   
   Debe realizarla una instancia independiente, específicamente Auditoría Interna o Seguridad de la Información, en cumplimiento del principio de segregación de funciones. Permitir que el mismo DBA concilie sus propias acciones elimina la objetividad del control y facilita la omisión de cambios no autorizados.