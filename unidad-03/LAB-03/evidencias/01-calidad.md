# Actividad 1 — Detección de problemas de calidad en la operación


## Registro de hallazgos


| # | Hallazgo | Registros | Regla de calidad | ¿Quién decide la corrección? | Acción propuesta |
|---|---|---|---|---|---|
| C1 | Posible cliente duplicado (ana.lopez@example.test) | 1, 7 | Unicidad del correo | Gerencia Comercial | Verificar con el área de ventas si se trata de la misma persona física; conservar el historial en el ID 1 y dar de baja lógica o eliminar el ID 7. |
| C2 | RFC incompleto (12 caracteres en persona física) y RFC nulo | 7, 8 | Formato y completitud del RFC | Gerencia Comercial / Área de Facturación | Solicitar la Constancia de Situación Fiscal para capturar el carácter de homoclave faltante en el ID 7 y recabar el RFC completo para el ID 8. |
| C3 | Dirección de correo electrónico mal formada (sin-correo) | 8 | Validez sintáctica | Gerencia Comercial / Atención a Clientes | Comunicarse por vía alternativa con el cliente para registrar una cuenta de correo válida y funcional. |
| C4 | Valor de edad negativo (-3) | 8 | Integridad de dominio (rango lógico) | Gerencia Comercial | Cotejar la fecha de nacimiento contra una identificación oficial vigente y actualizar el dato. |


(Nota operativa: Adicionalmente se detectó que en el registro 8 el teléfono 667 y el código postal 8000 están truncados, así como falta de normalización de acentos en Culiacan vs Culiacán).


---


## Respuestas a las preguntas de análisis


**1. ¿Por qué el DBA no debe corregir por su cuenta el RFC del registro 7?**  
   El rol del DBA se limita a la **custodia técnica** de la base de datos (garantizar disponibilidad, integridad estructural y seguridad), mientras que la autoridad sobre el contenido del dato recae en su **propietario** (Gerencia Comercial). El administrador de bases de datos carece de acceso a la documentación fiscal del cliente; deducir o completar manualmente la homoclave faltante introduciría información apócrifa con implicaciones fiscales y legales directas.


**2. ¿Qué restricción (CHECK, UNIQUE) habría evitado cada hallazgo? ¿Quién debería aprobar agregarla?**  

* **C1 (Duplicidad por correo):** Un índice único sobre el correo en minúsculas: CREATE UNIQUE INDEX idx_clientes_correo_unico ON clientes (lower(correo));.
* **C2 (RFC inválido o nulo):** La cláusula NOT NULL acompañada de CHECK.
* **C3 (Correo mal formado):** Una validación de patrón mediante CHECK.
* **C4 (Edad negativa):** Una restricción de intervalo numérico.
* **Autorización:** La aprobación corresponde a la Gerencia Comercial junto con los líderes de desarrollo de las aplicaciones cliente, ya que endurecer las reglas en el motor bloqueará inserciones incompletas provenientes de los formularios de captura.

**3. Si el DBA corrige un dato, ¿qué mecanismo del LAB-01 (Parte B) dejará evidencia del cambio?**  

   El disparador de auditoría a nivel de fila configurado sobre la tabla clientes. Al ejecutarse la sentencia UPDATE, el trigger invocará su función SECURITY DEFINER y almacenará automáticamente una fila en auditoria.cambios_clientes con la fotografía JSONB del registro antes (valores_antes) y después (valores_despues) de la corrección, además de identificar la sesión, aplicación y marca de tiempo exacta.