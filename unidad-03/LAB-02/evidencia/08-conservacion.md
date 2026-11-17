# Actividad 8 — Conservación: exportar antes de perder

**1. Menciona tres formas en que la evidencia del perfilador o de la bitácora puede perderse sin que nadie la borre deliberadamente.**

* Sobrescritura circular en system.profile: Al llenarse el tamaño fijo de 1 MB, MongoDB reemplaza automáticamente los registros más antiguos por los nuevos.

* Reinicio del servicio mongod: Se vacía por completo el búfer en memoria de getLog y cualquier configuración dinámica del perfilador vuelve al nivel 0.

* Desbordamiento de memoria o falta de logAppend: Superar los 1024 eventos en getLog expulsa los registros previos, y reiniciar sin logAppend en true sobrescribe el archivo físico de bitácora.

**2. ¿Por qué el tamaño de 1 MB de system.profile es un problema de conservación y no solo de espacio?**

Porque al ser una colección circular fija, alcanzar 1 MB no detiene la captura sino que provoca la destrucción automática de los documentos más antiguos. Esto reduce drásticamente la ventana de retención temporal e impide conservar evidencia forense si no se exporta de forma periódica.

**3. ¿Por qué getLog sirve para interpretar pero no para conservar?**

Sirve para interpretar porque permite consultar y filtrar eventos recientes en formato JSON directamente desde la consola administrativa. Sin embargo, no sirve para conservar porque lee un búfer volátil en memoria limitado a 1024 eventos que se pierde ante cualquier reinicio del servicio.