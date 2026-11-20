# User Story Mapping — EP-10: Control de horas e información de nómina

## Propósito

Este archivo desarrolla la décima épica de las [épicas consolidadas](epicas_sistema_rrhh.md) con la misma estructura utilizada en los mapas anteriores. Incluye el registro y revisión de horas, el seguimiento del calendario de nómina y la consulta de recibos y pagos.

La propuesta está adaptada a una firma de auditoría financiera con sede en Guatemala. Distingue tres responsabilidades que deben confirmarse por separado: registrar el tiempo laboral, distribuir horas entre clientes o proyectos y calcular la nómina. Las capturas de referencia muestran información y un acceso a un proveedor, pero no demuestran que el sistema de RR. HH. deba calcular impuestos, deducciones o pagos.

Las reglas laborales, tributarias, bancarias y de conservación deben validarse con los responsables de Nómina, Finanzas y el asesor del cliente antes de considerarse definitivas.

**Convención:** `HU-10-01` identifica la historia 01 de la épica 10. Las entregas son propuestas de prioridad, no fechas comprometidas.

## Avance por épica

| Épica | Nombre | Estado del mapping |
| --- | --- | --- |
| EP-01 | Portal del empleado y gestión de ausencias | [Desarrollada](UserStoryMapping.md#ep-01-portal-del-empleado-y-gestion-de-ausencias) |
| EP-02 | Creación y publicación de vacantes | [Actualizada con decisiones del cliente](UserStoryMappingEp2.md) |
| EP-03 | Selección y contratación de candidatos | [Actualizada con decisiones del cliente](UserStoryMappingEp3.md) |
| EP-04 | Administración de empleados y estructura organizacional | [Historias propuestas para validación](UserStoryMappingEp4.md) |
| EP-05 | Incorporación de nuevos empleados | [Historias propuestas para validación](UserStoryMappingEp5.md) |
| EP-06 | Historial laboral y beneficios | [Historias propuestas para validación](UserStoryMappingEp6.md) |
| EP-07 | Documentos y capacitación | Pendiente |
| EP-08 | Objetivos y evaluaciones de desempeño | Pendiente |
| EP-09 | Reportes y análisis de satisfacción | Pendiente |
| EP-10 | Control de horas e información de nómina | Historias propuestas para validación con el cliente |

---

## EP-10. Control de horas e información de nómina

### Resultado que busca el usuario

El empleado registra o consulta las horas del periodo correcto, conoce el estado de su hoja de tiempo y puede revisar sus recibos de pago. Los responsables validan horas y pendientes antes del cierre, mientras Nómina controla el calendario, incorpora resultados del proveedor y publica información verificable sin exponer datos salariales a usuarios no autorizados.

### Personas involucradas

- **Empleado:** registra o consulta sus horas, envía la hoja de tiempo y revisa sus recibos y acumulados permitidos.
- **Supervisor, gerente o socio:** revisa las hojas de las personas bajo su responsabilidad y resuelve observaciones según la política.
- **Responsable de proyecto o cliente:** posible aprobador de distribución de horas facturables; este rol requiere confirmación.
- **Nómina o Finanzas:** administra periodos, cierres, recordatorios, importaciones, excepciones y publicación de resultados.
- **RR. HH.:** mantiene datos laborales que afectan la elegibilidad y atiende correcciones dentro de sus permisos, sin sustituir necesariamente a Nómina.
- **Proveedor de nómina:** sistema externo que puede recibir o devolver información mediante archivo o integración confirmada.
- **Auditor autorizado:** consulta bitácoras y conciliaciones permitidas sin modificar los registros revisados.

### Mapa de actividades e historias

Las columnas siguen los recorridos de tiempo y pago. La primera entrega propone captura manual de horas, aprobación, calendario, importación controlada de resultados y consulta de recibos. El fichaje, la distribución por cliente y la integración automática quedan para ampliación o confirmación.

| Entrega | 1. Registrar tiempo | 2. Revisar y cerrar | 3. Preparar el periodo | 4. Consultar pagos | 5. Proteger e integrar |
| --- | --- | --- | --- | --- | --- |
| **Primera entrega** | [HU-10-01](#hu-10-01-consultar-la-hoja-del-periodo), [HU-10-02](#hu-10-02-registrar-horas-trabajadas), [HU-10-05](#hu-10-05-corregir-horas-y-consultar-el-historial), [HU-10-06](#hu-10-06-enviar-la-hoja-de-tiempo) | [HU-10-07](#hu-10-07-revisar-y-resolver-una-hoja-de-tiempo), [HU-10-08](#hu-10-08-bloquear-o-reabrir-un-periodo) | [HU-10-09](#hu-10-09-administrar-el-calendario-de-nómina), [HU-10-10](#hu-10-10-gestionar-recordatorios-del-periodo), [HU-10-11](#hu-10-11-controlar-el-resumen-y-las-excepciones), carga inicial de [HU-10-12](#hu-10-12-incorporar-resultados-de-nómina) | [HU-10-13](#hu-10-13-consultar-recibos-de-pago), [HU-10-14](#hu-10-14-consultar-el-detalle-de-un-recibo), [HU-10-15](#hu-10-15-descargar-o-imprimir-un-recibo), [HU-10-16](#hu-10-16-consultar-el-historial-y-los-acumulados), [HU-10-17](#hu-10-17-consultar-datos-de-pago-y-deducciones), [HU-10-18](#hu-10-18-reportar-una-discrepancia) | [HU-10-19](#hu-10-19-controlar-accesos-y-trazabilidad) |
| **Ampliación por validar** | [HU-10-03](#hu-10-03-registrar-entradas-y-salidas), [HU-10-04](#hu-10-04-distribuir-tiempo-por-cliente-o-proyecto) | Aprobación matricial de [HU-10-07](#hu-10-07-revisar-y-resolver-una-hoja-de-tiempo) | Automatizaciones de [HU-10-10](#hu-10-10-gestionar-recordatorios-del-periodo) | — | [HU-10-20](#hu-10-20-integrar-el-proveedor-de-nómina) |

### Historias de usuario

#### HU-10-01. Consultar la hoja del periodo

**Historia:** Como empleado, quiero consultar mi hoja de tiempo del periodo correcto para conocer los días, horas y pendientes que debo revisar.

**Criterios de aceptación propuestos:**

- La hoja identifica empleado, periodo, fechas, zona horaria aplicable y estado.
- Se muestran las horas por día y los totales del periodo, distinguiendo registros, ausencias y días sin información.
- El empleado puede navegar entre periodos permitidos sin editar uno bloqueado.
- Los horarios y días no laborables provienen de la configuración vigente del empleado.
- Un estado vacío distingue un día no trabajado de un registro todavía pendiente.

**Entrega propuesta:** Primera entrega.

#### HU-10-02. Registrar horas trabajadas

**Historia:** Como empleado, quiero registrar mis horas por día para declarar correctamente el tiempo trabajado.

**Criterios de aceptación propuestos:**

- La captura permite indicar fecha, cantidad de horas y comentario cuando la política lo requiera.
- El sistema valida que la fecha pertenezca a un periodo abierto y que la cantidad use los incrementos permitidos.
- Se advierten duplicados, solapamientos o totales que exceden los límites configurados, sin inventar automáticamente una solución.
- Las ausencias aprobadas de EP-01 pueden reflejarse en la hoja sin obligar al empleado a capturarlas nuevamente.
- Las horas ordinarias, extraordinarias, no laboradas o de otra categoría se separan únicamente si el cliente confirma esas clasificaciones.
- El empleado puede guardar un borrador antes de enviar el periodo.

**Entrega propuesta:** Primera entrega, sujeta a definir quiénes registran horas y qué categorías utilizan.

#### HU-10-03. Registrar entradas y salidas

**Historia:** Como empleado sujeto a fichaje, quiero registrar entrada y salida para que el sistema calcule la duración del trabajo presencial o remoto.

**Criterios de aceptación propuestos:**

- La función solo aparece para grupos de empleados cuya política requiera fichaje.
- Cada evento conserva fecha, hora, zona horaria, tipo y origen permitido.
- El sistema identifica una salida ausente, eventos duplicados o una secuencia imposible y solicita corrección.
- Una corrección no reemplaza silenciosamente el evento original y sigue el flujo de aprobación acordado.
- La ubicación, dispositivo o evidencia adicional solo se recopila si existe una finalidad confirmada y una regla de privacidad validada.

**Entrega propuesta:** Ampliación por validar.

#### HU-10-04. Distribuir tiempo por cliente o proyecto

**Historia:** Como profesional de auditoría, quiero asignar horas a clientes, compromisos o actividades internas para apoyar el control operativo y la facturación.

**Criterios de aceptación propuestos:**

- El empleado solo puede seleccionar proyectos, clientes o códigos a los que esté asignado y tenga acceso.
- Cada línea identifica fecha, horas, categoría y proyecto o actividad, sin modificar la relación laboral formal de EP-04.
- La suma distribuida coincide con el total diario o el sistema muestra la diferencia pendiente.
- Los nombres de clientes restringidos no aparecen a usuarios ajenos al compromiso.
- Cerrar una asignación impide nuevos registros desde la fecha definida, pero conserva el historial.
- El cliente debe confirmar si esta función pertenece al sistema de RR. HH. o a una herramienta profesional o de facturación independiente.

**Entrega propuesta:** Ampliación por validar.

#### HU-10-05. Corregir horas y consultar el historial

**Historia:** Como empleado o responsable autorizado, quiero corregir un registro con trazabilidad para resolver errores sin perder el dato original.

**Criterios de aceptación propuestos:**

- Durante el borrador, el empleado puede corregir sus registros dentro de las reglas del periodo.
- Después del envío o cierre, una corrección requiere solicitud, motivo y aprobación según la política.
- El historial muestra valor anterior, valor nuevo, autor, fecha, motivo y resolución.
- Una corrección aprobada recalcula los totales afectados y señala si el resultado ya fue enviado a Nómina.
- Los usuarios que consultan una hoja ven la versión vigente y pueden abrir el historial únicamente si tienen permiso.

**Entrega propuesta:** Primera entrega.

#### HU-10-06. Enviar la hoja de tiempo

**Historia:** Como empleado, quiero enviar mi hoja del periodo para indicar que está completa y lista para revisión.

**Criterios de aceptación propuestos:**

- Antes del envío se muestran total de horas, días incompletos, advertencias y errores que impiden continuar.
- El envío cambia la hoja de borrador a enviada y registra fecha y usuario.
- Una hoja enviada queda protegida contra edición directa mientras se revisa.
- El empleado puede retirar el envío antes de la revisión únicamente si la política lo permite y deja motivo.
- El sistema confirma el resultado sin presentar una hoja rechazada por validaciones como enviada.

**Entrega propuesta:** Primera entrega.

#### HU-10-07. Revisar y resolver una hoja de tiempo

**Historia:** Como responsable autorizado, quiero aprobar o devolver una hoja de tiempo para asegurar que el periodo esté completo antes del cierre.

**Criterios de aceptación propuestos:**

- El responsable ve las hojas que le corresponde revisar, con totales, excepciones y fecha límite.
- Puede aprobar o devolver para corrección; devolver exige comentario visible para el empleado.
- La resolución registra responsable, fecha, resultado y comentario.
- El responsable no puede aprobar su propia hoja salvo que la firma defina una excepción.
- Si las horas por cliente requieren un aprobador diferente del responsable laboral, el sistema puede incorporar una aprobación matricial cuando el cliente confirme el flujo.
- Una aprobación no significa que la nómina ya fue calculada o pagada.

**Entrega propuesta:** Aprobación básica en primera entrega; aprobación matricial en ampliación.

#### HU-10-08. Bloquear o reabrir un periodo

**Historia:** Como responsable de Nómina, quiero bloquear o reabrir hojas de tiempo para controlar qué información puede cambiar durante el procesamiento.

**Criterios de aceptación propuestos:**

- El bloqueo identifica periodo, alcance, responsable y fecha efectiva.
- Una hoja bloqueada no permite cambios ordinarios y muestra el motivo y el canal de corrección.
- Reabrir exige motivo, autorización y registro de las hojas afectadas.
- Si la información ya fue enviada al proveedor, la reapertura genera una excepción que debe conciliarse.
- Bloquear el periodo no borra solicitudes de corrección ni el historial.

**Entrega propuesta:** Primera entrega.

#### HU-10-09. Administrar el calendario de nómina

**Historia:** Como responsable de Nómina, quiero consultar y mantener las fechas del proceso para coordinar cierres, pagos y actividades relacionadas.

**Criterios de aceptación propuestos:**

- Cada periodo identifica inicio, fin, fecha límite de horas, fechas de aprobación, procesamiento y pago.
- El calendario distingue periodos abiertos, en revisión, bloqueados, procesados y pagados, según los estados confirmados.
- Los cambios de fecha registran responsable, motivo y usuarios afectados.
- Feriados y días no laborables relevantes se toman de una fuente acordada y no se aplican silenciosamente a todos los grupos.
- Los empleados ven las fechas que les afectan; solo Nómina modifica el calendario.

**Entrega propuesta:** Primera entrega.

#### HU-10-10. Gestionar recordatorios del periodo

**Historia:** Como responsable de Nómina, quiero crear y seguir recordatorios para evitar que una tarea pendiente retrase el pago.

**Criterios de aceptación propuestos:**

- Los recordatorios pueden dirigirse a empleados, responsables, RR. HH. o Nómina según la tarea.
- Se contemplan hojas sin enviar, aprobaciones pendientes, excepciones, importaciones y validaciones del periodo.
- Un recordatorio muestra acción y fecha límite sin incluir salario u otra información sensible innecesaria.
- Las tareas completadas se distinguen de las pendientes y conservan responsable y fecha.
- En ampliación se pueden configurar reglas automáticas y escalamiento; la primera entrega permite recordatorios base y seguimiento manual.

**Entrega propuesta:** Primera entrega; automatización avanzada en ampliación.

#### HU-10-11. Controlar el resumen y las excepciones

**Historia:** Como responsable autorizado de Nómina, quiero consultar el resumen del periodo y sus excepciones para decidir si está listo para procesarse.

**Criterios de aceptación propuestos:**

- El resumen muestra cantidad de empleados incluidos, hojas pendientes, aprobaciones, correcciones, altas, bajas y otras excepciones confirmadas.
- El monto total de nómina o requerimiento de fondos solo aparece cuando proviene de una fuente identificada y para roles autorizados.
- Los totales indican moneda, periodo, fecha de actualización y origen.
- El sistema no presenta una estimación como monto final procesado.
- Desde cada excepción se puede abrir el registro relacionado dentro de los permisos del usuario.

**Entrega propuesta:** Primera entrega, sujeta a definir la fuente y los indicadores.

#### HU-10-12. Incorporar resultados de nómina

**Historia:** Como responsable de Nómina, quiero incorporar los resultados procesados para publicar recibos y conservar una conciliación verificable.

**Criterios de aceptación propuestos:**

- La primera entrega permite una carga controlada mediante un formato acordado, con periodo, empleado y moneda identificables.
- Antes de confirmar se validan empleados desconocidos, duplicados, periodo, totales, estructura y campos obligatorios.
- El sistema muestra un resumen de registros aceptados, rechazados y advertencias sin publicar parcialmente en silencio.
- Confirmar la carga conserva archivo de origen o referencia, responsable, fecha, resultado y versión.
- Reemplazar un resultado publicado requiere autorización, motivo y nueva versión.
- La carga incorpora resultados; no afirma que este sistema calculó impuestos, deducciones o pago neto.

**Entrega propuesta:** Carga controlada en primera entrega; integración automática en HU-10-20.

#### HU-10-13. Consultar recibos de pago

**Historia:** Como empleado, quiero consultar mis recibos para conocer los pagos disponibles por periodo.

**Criterios de aceptación propuestos:**

- El empleado solo ve sus propios recibos publicados y los periodos permitidos.
- El listado identifica fecha de pago, periodo, total bruto, deducciones, impuestos y neto cuando esos datos estén disponibles.
- Un recibo en preparación o con una carga no confirmada no aparece como publicado.
- Si no hay recibo, se muestra un estado comprensible sin revelar información de procesamiento interno.
- Abrir un recibo requiere una sesión autenticada y respeta medidas adicionales que se definan para datos salariales.

**Entrega propuesta:** Primera entrega.

#### HU-10-14. Consultar el detalle de un recibo

**Historia:** Como empleado, quiero revisar el desglose de un recibo para entender los conceptos que forman mi pago.

**Criterios de aceptación propuestos:**

- El detalle identifica empleado, periodo, fecha, moneda y versión del recibo.
- Se muestran ingresos, impuestos, deducciones, pago neto y, cuando aplique, horas o bases informativas recibidas del proveedor.
- Cada concepto conserva el nombre y valor suministrados por la fuente aprobada; el sistema no recategoriza importes sin una regla.
- Se distinguen importes del periodo y acumulados del año cuando ambos existan.
- La interfaz evita mostrar números completos de cuentas bancarias u otros identificadores sensibles.

**Entrega propuesta:** Primera entrega.

#### HU-10-15. Descargar o imprimir un recibo

**Historia:** Como empleado, quiero descargar o imprimir mi recibo para conservarlo o presentarlo cuando lo necesite.

**Criterios de aceptación propuestos:**

- La descarga corresponde al mismo periodo y versión mostrados en pantalla.
- El documento identifica su origen, empleado, periodo, moneda y fecha de emisión.
- Solo el empleado y los roles expresamente autorizados pueden generar el archivo.
- La descarga o impresión queda registrada conforme a la política de trazabilidad.
- El archivo evita exponer más datos personales o bancarios de los necesarios.

**Entrega propuesta:** Primera entrega.

#### HU-10-16. Consultar el historial y los acumulados

**Historia:** Como empleado, quiero consultar pagos anteriores y acumulados para revisar mi información a lo largo del año.

**Criterios de aceptación propuestos:**

- El historial ordena los pagos por fecha y permite abrir cada recibo disponible.
- Los acumulados identifican año, moneda, fecha de corte y fuente.
- Si se reemplaza un recibo, el empleado ve la versión vigente y el sistema conserva la trazabilidad de versiones anteriores para roles autorizados.
- Los acumulados se recalculan o importan de forma consistente con los recibos publicados.
- La ausencia de periodos anteriores no se interpreta automáticamente como falta de pago.

**Entrega propuesta:** Primera entrega.

#### HU-10-17. Consultar datos de pago y deducciones

**Historia:** Como empleado, quiero consultar un resumen de mi forma de pago y deducciones vigentes para detectar información desactualizada.

**Criterios de aceptación propuestos:**

- El resumen muestra únicamente datos enmascarados de cuentas o medios de pago.
- Se pueden mostrar deducciones y aportes vigentes con nombre, tipo y fecha efectiva cuando su fuente esté confirmada.
- El empleado no edita directamente información bancaria o deducciones mediante esta consulta.
- Una corrección se deriva al proceso autorizado y deja solicitud e historial.
- Los detalles fiscales, bancarios o de terceros solo son visibles para los roles que los necesitan.

**Entrega propuesta:** Primera entrega si la fuente está disponible; de lo contrario, después de la integración correspondiente.

#### HU-10-18. Reportar una discrepancia

**Historia:** Como empleado, quiero reportar una diferencia en mis horas o recibo para que el área responsable pueda investigarla.

**Criterios de aceptación propuestos:**

- El reporte se vincula al periodo, hoja o recibo correcto y permite describir la diferencia.
- El empleado puede adjuntar respaldo dentro de los formatos y límites acordados.
- La solicitud tiene estado, responsable, fecha de respuesta y resolución.
- Corregir un pago o una hoja sigue el flujo autorizado y no modifica silenciosamente un recibo ya publicado.
- La respuesta evita incluir datos salariales en canales inseguros o notificaciones generales.

**Entrega propuesta:** Primera entrega.

#### HU-10-19. Controlar accesos y trazabilidad

**Historia:** Como responsable de seguridad, quiero limitar y auditar el acceso a horas y nómina para proteger información laboral y salarial.

**Criterios de aceptación propuestos:**

- Los permisos distinguen registrar, revisar, aprobar, bloquear, importar, publicar, consultar, descargar y exportar.
- Un supervisor accede únicamente a las hojas de su alcance y no ve recibos o datos salariales por esa relación, salvo permiso expreso.
- Nómina y RR. HH. tienen alcances diferenciados; ser administrador técnico no concede acceso automático a salarios o cuentas.
- Consultas, descargas, exportaciones, cambios, aprobaciones, reaperturas, cargas y publicaciones sensibles dejan trazabilidad.
- La bitácora conserva usuario, fecha, acción, periodo y resultado sin copiar contraseñas, cuentas completas o documentos íntegros.

**Entrega propuesta:** Primera entrega.

#### HU-10-20. Integrar el proveedor de nómina

**Historia:** Como responsable de Nómina, quiero intercambiar datos con el proveedor autorizado para reducir recaptura y mantener resultados conciliados.

**Criterios de aceptación propuestos:**

- La integración solo se activa después de confirmar proveedor, contrato, método técnico, datos, frecuencia y responsables.
- Antes de enviar se valida el periodo, los empleados incluidos, aprobaciones y excepciones.
- Cada envío o recepción conserva identificador, fecha, resultado y detalle de errores procesables.
- El sistema permite conciliar cantidad de empleados y totales entre origen y respuesta sin marcar como exitoso un intercambio parcial.
- Los reintentos no generan duplicados y requieren controles para versiones ya publicadas.
- Si la integración no está disponible, la carga controlada de HU-10-12 permanece como alternativa.

**Entrega propuesta:** Ampliación sujeta a proveedor e integración.

### Reglas provenientes de épicas anteriores

| Tema | Decisión que debe respetar EP-10 |
| --- | --- |
| Empleados y permisos | EP-04 mantiene el expediente vigente, la estructura formal y los niveles de acceso. Un rol técnico no recibe acceso automático a información salarial. |
| Ausencias | Las ausencias aprobadas de EP-01 deben evitar recaptura o contradicciones con los días y horas del periodo. |
| Incorporaciones y bajas | EP-05 confirma la fecha real de ingreso; EP-04 registra estado y vigencia. Ambos datos determinan en qué periodos participa una persona. |
| Cambios laborales | Puesto, compensación, estado y otras condiciones con vigencia pertenecen al historial de EP-06 y deben llegar a Nómina desde una fuente identificada. |
| Documentos | Los recibos son documentos sensibles y deben respetar las reglas de acceso, versión y conservación que se definan con EP-07. |
| Trazabilidad | Las épicas anteriores exigen registro de consultas, exportaciones y modificaciones de datos sensibles. |

### Decisiones pendientes para validar con el cliente

1. **Alcance de nómina:** definir si el sistema solo consulta y coordina, si prepara novedades o si también calcula nómina, impuestos, deducciones y pagos.
2. **Proveedor actual:** identificar el sistema utilizado en Guatemala, capacidades de integración, formatos, responsables y fuente oficial de cada dato.
3. **Población que registra horas:** confirmar qué empleados usan hoja manual, fichaje, horario fijo o registro por excepción.
4. **Periodos y horarios:** definir frecuencia de pago, fechas de corte, zonas horarias, jornadas, descansos, feriados y reglas para distintos contratos.
5. **Categorías de tiempo:** acordar horas ordinarias, extraordinarias, compensatorias, ausencias, capacitación, trabajo interno y otras categorías.
6. **Horas por cliente o proyecto:** decidir si se gestionan aquí o en otro sistema, qué códigos se usan y quién aprueba tiempo facturable.
7. **Aprobaciones y correcciones:** definir responsables, sustituciones, autoaprobación, reaperturas, plazos y tratamiento después de enviar al proveedor.
8. **Horas extraordinarias:** validar autorización previa, límites, cálculo, evidencia y relación con nómina según la política y asesoría aplicable.
9. **Recibos y conceptos:** confirmar campos, moneda, acumulados, nomenclatura, versión oficial y formato de descarga.
10. **Calendario y recordatorios:** establecer hitos, listas de verificación, destinatarios, escalamiento y responsables de cada tarea.
11. **Cuentas y deducciones:** definir qué información puede consultar el empleado y cuál es el flujo autorizado para solicitar cambios.
12. **Privacidad y conservación:** validar acceso, retención, exportación, bitácoras y medidas para horas, recibos, cuentas y datos tributarios.
13. **Volumen y cierre:** confirmar número de empleados, procesamiento simultáneo, cierres retroactivos y años de historial que se migrarán.
14. **Experiencia móvil:** decidir si registro de horas, aprobación y recibos deben funcionar completamente desde celular.

### Criterio de éxito de la épica

Los empleados y responsables pueden completar y resolver las hojas de tiempo del periodo correcto, Nómina identifica pendientes y controla el cierre, y cada empleado consulta recibos y acumulados confiables. Los resultados conservan su fuente y versión, las correcciones son trazables y la solución no atribuye al sistema cálculos o pagos que corresponden al proveedor externo.
