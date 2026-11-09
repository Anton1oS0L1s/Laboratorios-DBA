# Actividad 13 — Altas y bajas

1. El cliente Pedro Ruiz ya no existe en clientes. ¿Dónde queda evidencia de que existió y de sus datos?

La evidencia queda almacenada en la tabla auditoria.cambios_clientes. Aunque el registro fue eliminado de la tabla operativa clientes, la auditoría conserva la fotografía completa en formato JSONB del momento en que fue creado (valores_despues en el evento 2) y del momento exacto en que fue borrado (valores_antes en el evento 3).

2. ¿Por qué ip_cliente está vacía en los eventos 2 y 3?

Porque los eventos 2 y 3 fueron ejecutados por el usuario postgres desde una consola local (psql) conectada mediante un socket de UNIX del propio servidor. Al no tratarse de una conexión a través de la red (TCP/IP), no existe una dirección IP asignada a la sesión.

3. La política de retención de la Unidad II pedía eliminar datos cuando ya no fueran necesarios. ¿Qué conflicto aparece? ¿Quién debe resolverlo?

* Conflicto: Existe una contradicción entre la privacidad/derecho al olvido (que exige eliminar la información personal del cliente al darle de baja) y las normas de auditoría y seguridad (que exigen conservar la trazabilidad histórica de quién creó o borró datos para evitar fraudes).

* Quién debe resolverlo: Debe resolverlo el área legal y de cumplimiento de la empresa junto con el Oficial de Protección de Datos (DPO), quienes deben definir una política formal que determine si los datos en la auditoría se conservan durante un plazo legal obligatorio, si se anonimizan (borrando el RFC/nombre pero dejando la marca del evento), o en qué momento exacto se depuran.