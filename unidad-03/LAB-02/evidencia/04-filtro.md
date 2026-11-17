# Actividad 4 — Reducir el volumen con un filtro

**1. ¿Qué perdiste de evidencia al aplicar el filtro? ¿Qué ganaste?**

* Evidencia perdida:

    Se dejó de registrar toda actividad de lectura como consultas find, agregaciones y conteos, así como comandos administrativos. Esto impide detectar consultas indebidas o fugas de información confidencial mediante lectura.

* Beneficios obtenidos:

    Disminuyó el consumo de recursos y el crecimiento acelerado de system.profile, evitando que su límite circular de 1 MB sobrescriba rápidamente las operaciones críticas de inserción, actualización y eliminación, y reduciendo la captura de datos personales presentes en filtros de lectura.

**2. ¿Qué filtro usarías si solo interesaran operaciones sobre la colección clientes?**

Se utilizaría un filtro sobre el atributo ns apuntando al espacio de nombres completo comercial.clientes:

```JavaScript
db.setProfilingLevel(1, { filter: { ns: "comercial.clientes" } })
```

En caso de requerir únicamente modificaciones sobre dicha colección, se combinan el espacio de nombres y el tipo de operación:

```JavaScript
db.setProfilingLevel(1, { filter: { ns: "comercial.clientes", op: { $in: ["insert", "update", "remove"] } } })
```