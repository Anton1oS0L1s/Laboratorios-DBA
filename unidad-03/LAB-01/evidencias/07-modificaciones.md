
# Actividad 7 - Modificaciones de datos: ddl frente a mod

1. ¿Qué nivel habría registrado la lectura del RFC? ¿Qué costo tendría en un servidor con miles de consultas por minuto?

El nivel all (log_statement = 'all'), ya que es el único ajuste que registra la totalidad de las sentencias ejecutadas, incluyendo las consultas de lectura (SELECT).

En un servidor con miles de operaciones por minuto, esto generaría:
* Saturación del disco: Los archivos de registro crecerían de forma descontrolada en muy poco tiempo, agotando el almacenamiento y haciendo que la base de datos se vuelva lenta.   
* Sobrecarga de trabajo: El motor tendría que dedicar gran parte de su capacidad de procesamiento únicamente a dar formato y escribir cada consulta en el disco.   
* Riesgo de fuga de datos: La bitácora guardaría en texto plano la información privada y los datos personales que se busquen en las cláusulas de las consultas.   
2. ¿Qué le falta a esta bitácora para revertir el cambio con certeza?

Le falta guardar el valor anterior que tenía el dato antes de ser alterado. La bitácora del servidor únicamente anota la instrucción SQL recibida (el UPDATE), pero no conserva cuál era la información original que estaba en la tabla, lo que impide saber con exactitud qué valor se debe restaurar.