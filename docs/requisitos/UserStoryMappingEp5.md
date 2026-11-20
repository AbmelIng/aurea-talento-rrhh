# User Story Mapping — EP-05: Incorporación de nuevos empleados

## Propósito

Este archivo desarrolla la quinta épica de las [épicas consolidadas](epicas_sistema_rrhh.md) con la misma estructura utilizada en los mapas anteriores. El recorrido comienza cuando una persona acepta una oferta en EP-03 y termina cuando su ingreso queda confirmado, el expediente se activa y las tareas iniciales están controladas.

La propuesta está adaptada a una firma de auditoría financiera con sede en Guatemala. Considera incorporaciones condicionadas, acceso restringido a documentos, preparación de equipo y cuentas, salvaguardas de independencia y coordinación entre RR. HH., TI, jefatura y nuevo empleado. Los documentos exigidos, las reglas de firma y los plazos deben validarse con el cliente y su asesor antes de considerarse definitivos.

**Convención:** `HU-05-01` identifica la historia 01 de la épica 05. Las entregas son propuestas de prioridad, no fechas comprometidas.

## Avance por épica

| Épica | Nombre | Estado del mapping |
| --- | --- | --- |
| EP-01 | Portal del empleado y gestión de ausencias | [Desarrollada](UserStoryMapping.md#ep-01-portal-del-empleado-y-gestion-de-ausencias) |
| EP-02 | Creación y publicación de vacantes | [Actualizada con decisiones del cliente](UserStoryMappingEp2.md) |
| EP-03 | Selección y contratación de candidatos | [Actualizada con decisiones del cliente](UserStoryMappingEp3.md) |
| EP-04 | Administración de empleados y estructura organizacional | [Historias propuestas para validación](UserStoryMappingEp4.md) |
| EP-05 | Incorporación de nuevos empleados | Historias propuestas para validación con el cliente |
| EP-06 | Historial laboral y beneficios | [Historias propuestas para validación](UserStoryMappingEp6.md) |
| EP-07 | Documentos y capacitación | Pendiente |
| EP-08 | Objetivos y evaluaciones de desempeño | Pendiente |
| EP-09 | Reportes y análisis de satisfacción | Pendiente |
| EP-10 | Control de horas e información de nómina | [Historias propuestas para validación](UserStoryMappingEp10.md) |

---

## EP-05. Incorporación de nuevos empleados

### Resultado que busca el usuario

La persona contratada recibe información clara, entrega los datos y documentos necesarios y conoce lo que debe completar antes de su ingreso. RR. HH., TI, la jefatura y las áreas de apoyo coordinan sus tareas, identifican bloqueos y confirman que la persona puede incorporarse sin omisiones críticas.

### Personas involucradas

- **Nuevo empleado:** completa datos, entrega documentos, confirma políticas y atiende sus tareas antes y después del primer día.
- **RR. HH.:** inicia y coordina la incorporación, valida documentos, asigna tareas, controla condiciones pendientes y confirma el ingreso.
- **Responsable directo:** prepara objetivos, agenda, presentación y acompañamiento inicial.
- **TI o seguridad tecnológica:** prepara cuenta, equipo, correo y accesos autorizados.
- **Administración o instalaciones:** prepara espacio, credenciales y recursos físicos cuando corresponda.
- **Nómina o Finanzas:** recibe únicamente los datos necesarios para pago y alta administrativa, conforme a los permisos acordados.
- **Cumplimiento / Independencia:** confirma salvaguardas y restricciones que deban aplicarse desde el primer día.
- **Socio u otros responsables:** atienden tareas o excepciones específicas cuando la política lo requiera.

### Mapa de actividades e historias

Las columnas siguen el recorrido desde la oferta aceptada hasta la activación del empleado. La primera entrega propone un circuito completo con tareas y documentos; las integraciones y la firma electrónica pueden añadirse después.

| Entrega | 1. Iniciar | 2. Recopilar | 3. Preparar | 4. Dar seguimiento | 5. Confirmar el ingreso |
| --- | --- | --- | --- | --- | --- |
| **Primera entrega** | [HU-05-01](#hu-05-01-iniciar-una-incorporación), [HU-05-02](#hu-05-02-controlar-una-incorporación-condicionada), configuración base de [HU-05-03](#hu-05-03-aplicar-una-plantilla-de-incorporación), [HU-05-04](#hu-05-04-enviar-el-paquete-de-bienvenida) | [HU-05-05](#hu-05-05-completar-datos-personales), [HU-05-06](#hu-05-06-completar-la-presentación-personal), [HU-05-07](#hu-05-07-entregar-y-validar-documentos), alternativa inicial de [HU-05-08](#hu-05-08-firmar-o-confirmar-documentos) | [HU-05-09](#hu-05-09-asignar-tareas-de-incorporación), [HU-05-10](#hu-05-10-atender-tareas-asignadas), [HU-05-13](#hu-05-13-preparar-cuentas-equipo-y-accesos), [HU-05-14](#hu-05-14-preparar-el-primer-día) | [HU-05-11](#hu-05-11-consultar-el-avance-y-los-bloqueos), [HU-05-12](#hu-05-12-recordar-y-escalar-tareas-vencidas), [HU-05-17](#hu-05-17-proteger-y-auditar-datos-de-incorporación) | [HU-05-15](#hu-05-15-confirmar-el-ingreso-y-activar-el-expediente), [HU-05-16](#hu-05-16-cancelar-una-incorporación-no-completada) |
| **Ampliación** | Plantillas configurables de [HU-05-03](#hu-05-03-aplicar-una-plantilla-de-incorporación) | Firma electrónica de [HU-05-08](#hu-05-08-firmar-o-confirmar-documentos) | Automatización de aprovisionamiento de [HU-05-13](#hu-05-13-preparar-cuentas-equipo-y-accesos) | Recordatorios e integraciones avanzadas de [HU-05-12](#hu-05-12-recordar-y-escalar-tareas-vencidas) | — |

### Historias de usuario

#### HU-05-01. Iniciar una incorporación

**Historia:** Como integrante de RR. HH., quiero iniciar la incorporación desde una oferta aceptada para coordinar el ingreso sin volver a capturar información.

**Criterios de aceptación propuestos:**

- La incorporación se vincula a la persona, candidatura, oferta final, vacante y plaza correctas.
- Se reciben los datos permitidos por EP-03: datos personales y de contacto, puesto, nivel, área, jefe, fecha prevista, salario aprobado, oferta final, estados permitidos de verificaciones, salvaguardas y documentos.
- No se transfieren notas, rúbricas ni calificaciones de selección.
- Antes de iniciar, el sistema identifica un expediente existente o una incorporación activa para evitar duplicados.
- Se registra quién inició el proceso, cuándo y la fecha prevista de ingreso.
- El inicio de la incorporación no confirma que la persona ya se presentó a trabajar ni cubre definitivamente la plaza.

**Entrega propuesta:** Primera entrega.

#### HU-05-02. Controlar una incorporación condicionada

**Historia:** Como integrante de RR. HH., quiero distinguir una incorporación sujeta a condiciones para preparar el ingreso sin confirmar prematuramente la contratación.

**Criterios de aceptación propuestos:**

- La incorporación identifica cada verificación pendiente permitida, su responsable, estado y fecha límite.
- La declaración de independencia debe estar completa y resuelta antes de emitir la oferta, conforme a EP-03; no puede trasladarse como condición pendiente ordinaria.
- El proceso puede avanzar en tareas preparatorias mientras una condición autorizada sigue en curso.
- No se confirma el ingreso ni se activan accesos definitivos hasta que RR. HH. marque las condiciones obligatorias como resueltas.
- Un resultado que impida el ingreso bloquea la activación y remite al flujo de retiro de oferta o cancelación definido en EP-03 y HU-05-16.

**Entrega propuesta:** Primera entrega.

#### HU-05-03. Aplicar una plantilla de incorporación

**Historia:** Como integrante de RR. HH., quiero aplicar una lista de actividades adecuada al puesto para no omitir preparaciones necesarias.

**Criterios de aceptación propuestos:**

- La primera entrega ofrece plantillas base diferenciables por grupo, ubicación o tipo de empleo según lo que confirme el cliente.
- La plantilla genera tareas con responsable relativo, fecha calculada y condición de obligatoriedad.
- RR. HH. revisa las tareas antes de activar el proceso y puede añadir una tarea específica con justificación.
- Las tareas relacionadas con independencia, equipo, accesos, documentos y primer día pueden variar por perfil.
- En ampliación, RR. HH. puede crear, versionar e inactivar plantillas sin alterar incorporaciones ya iniciadas.

**Entrega propuesta:** Plantillas base en primera entrega; administración configurable en ampliación.

#### HU-05-04. Enviar el paquete de bienvenida

**Historia:** Como integrante de RR. HH., quiero enviar un paquete de bienvenida para que la persona conozca su ingreso y complete las acciones iniciales.

**Criterios de aceptación propuestos:**

- El paquete muestra un saludo, puesto, fecha prevista de ingreso, responsable, instrucciones del primer día y tareas asignadas al nuevo empleado.
- Incluye acceso seguro para completar datos y documentos sin requerir una cuenta laboral plenamente activa.
- Antes de enviarlo, RR. HH. revisa destinatario, contenido, fecha y documentos visibles.
- El sistema registra envío, entrega cuando pueda confirmarse y reenvíos.
- El paquete está en español, funciona en celular y no revela información interna de la firma o de clientes que no corresponda al destinatario.

**Entrega propuesta:** Primera entrega.

#### HU-05-05. Completar datos personales

**Historia:** Como nuevo empleado, quiero completar los datos necesarios para mi expediente y alta administrativa mediante un canal seguro.

**Criterios de aceptación propuestos:**

- El formulario solicita únicamente los campos definidos como necesarios para la incorporación en Guatemala.
- Los datos ya transferidos aparecen precargados cuando sea apropiado y la persona puede corregirlos o solicitar corrección.
- Los campos aplican formato, obligatoriedad y explicación de finalidad.
- La persona puede guardar un avance y conoce qué información falta.
- Los datos bancarios, de identificación, emergencia u otras categorías sensibles tienen acceso restringido y no aparecen en tareas de usuarios no autorizados.
- RR. HH. puede revisar el envío y resolver discrepancias antes de activar el expediente.

**Entrega propuesta:** Primera entrega.

#### HU-05-06. Completar la presentación personal

**Historia:** Como nuevo empleado, quiero proporcionar una presentación breve y una fotografía opcional para facilitar mi bienvenida al equipo.

**Criterios de aceptación propuestos:**

- La persona conoce qué respuestas o imagen se compartirán internamente y con qué audiencia.
- La fotografía y las respuestas de presentación son opcionales salvo que el cliente justifique otra regla.
- Se muestra una vista previa antes de enviar y se permite corregir el contenido mientras el paquete esté abierto.
- RR. HH. puede excluir contenido inapropiado sin modificar silenciosamente la respuesta original.
- La presentación no solicita religión, salud, estado civil ni otras categorías sensibles que no sean necesarias.

**Entrega propuesta:** Primera entrega, sujeta a confirmación de campos y audiencia.

#### HU-05-07. Entregar y validar documentos

**Historia:** Como nuevo empleado, quiero cargar los documentos requeridos para completar mi alta sin enviarlos por canales informales.

**Criterios de aceptación propuestos:**

- La lista identifica documento, finalidad, obligatoriedad, fecha límite, formatos y tamaño permitidos.
- El sistema acepta únicamente archivos permitidos, los revisa contra virus y cifra o protege su almacenamiento según la política técnica.
- RR. HH. puede marcar un documento como pendiente de revisión, válido, rechazado o requiere corrección, con comentario visible para la persona cuando corresponda.
- Cada nueva versión conserva fecha y responsable sin confundirla con la versión aceptada.
- Los documentos de selección que ya fueron transferidos no se solicitan nuevamente si siguen siendo válidos.
- La lista exacta de DPI, NIT, afiliaciones, información bancaria, constancias, contratos u otros documentos se confirma con RR. HH. y el asesor antes de implementarse.

**Entrega propuesta:** Primera entrega.

#### HU-05-08. Firmar o confirmar documentos

**Historia:** Como nuevo empleado, quiero revisar y aceptar los documentos que me corresponden para dejar evidencia de su entrega y aceptación.

**Criterios de aceptación propuestos:**

- Cada documento identifica versión, fecha, responsable emisor y acción requerida: lectura, confirmación o firma.
- Antes de aceptar, la persona puede abrir o descargar la versión completa.
- La evidencia queda vinculada a la persona y a la versión exacta.
- En la primera entrega, RR. HH. puede cargar una versión firmada por el medio autorizado y registrar su validación.
- La firma electrónica puede añadirse cuando se seleccione el mecanismo y se valide su uso; una simple casilla no se presenta como firma si no cumple la regla acordada.
- Corregir un documento firmado genera una versión nueva y solicita una nueva aceptación cuando el cambio sea relevante.

**Entrega propuesta:** Alternativa manual controlada en primera entrega; firma electrónica en ampliación.

#### HU-05-09. Asignar tareas de incorporación

**Historia:** Como integrante de RR. HH., quiero asignar tareas a cada participante para que la preparación tenga responsables y fechas claras.

**Criterios de aceptación propuestos:**

- Cada tarea tiene título, descripción, responsable, fecha límite, dependencia, prioridad y evidencia requerida cuando aplique.
- Se pueden asignar tareas a RR. HH., TI, jefatura, Administración, Nómina, Cumplimiento y nuevo empleado según sus permisos.
- Una persona solo ve la información necesaria para cumplir su tarea; asignarle una tarea no concede acceso al expediente completo.
- Las tareas pueden calcularse respecto de la fecha prevista de ingreso y actualizarse de forma controlada si esta cambia.
- Las tareas obligatorias se distinguen de las recomendadas.

**Entrega propuesta:** Primera entrega.

#### HU-05-10. Atender tareas asignadas

**Historia:** Como participante de una incorporación, quiero consultar y completar mis tareas para dejar constancia del avance.

**Criterios de aceptación propuestos:**

- Cada usuario ve sus tareas pendientes, próximas, vencidas y completadas.
- Una tarea puede requerir comentario, archivo o confirmación antes de completarse.
- Completarla registra usuario y fecha; reabrirla exige motivo y deja historial.
- Las dependencias impiden marcar como final una tarea cuyo requisito previo obligatorio sigue pendiente.
- El nuevo empleado puede realizar sus tareas esenciales desde un celular.

**Entrega propuesta:** Primera entrega.

#### HU-05-11. Consultar el avance y los bloqueos

**Historia:** Como integrante de RR. HH., quiero ver el avance de cada incorporación para detectar omisiones antes del ingreso.

**Criterios de aceptación propuestos:**

- El resumen muestra porcentaje o conteo de tareas completadas, pendientes, vencidas y bloqueadas por responsable o área.
- Las condiciones de contratación pendientes se distinguen de las tareas administrativas.
- RR. HH. puede abrir el detalle de una tarea sin recibir acceso a documentos reservados para otra función cuando no corresponda.
- El responsable directo consulta el avance necesario para preparar el ingreso, sin ver datos bancarios, identificación ni documentos restringidos.
- El sistema destaca los bloqueos que impiden confirmar el ingreso.

**Entrega propuesta:** Primera entrega.

#### HU-05-12. Recordar y escalar tareas vencidas

**Historia:** Como coordinador de RR. HH., quiero recordar y escalar tareas próximas o vencidas para resolverlas antes de que afecten el ingreso.

**Criterios de aceptación propuestos:**

- La firma puede definir recordatorios antes y después de la fecha límite para responsables y nuevo empleado.
- Un recordatorio identifica la tarea y la acción requerida sin incluir información sensible innecesaria en el correo.
- Las tareas críticas vencidas pueden escalarse a RR. HH. y al responsable funcional acordado.
- Posponer, reasignar o dispensar una tarea obligatoria exige motivo y queda registrado.
- Las reglas definitivas de escalamiento y tratamiento de tareas vencidas se validan con el cliente.

**Entrega propuesta:** Recordatorios básicos en primera entrega; reglas configurables e integraciones en ampliación.

#### HU-05-13. Preparar cuentas, equipo y accesos

**Historia:** Como responsable de TI o Administración, quiero preparar los recursos aprobados para que estén disponibles cuando la persona se incorpore.

**Criterios de aceptación propuestos:**

- Las tareas pueden incluir correo, cuenta de red, aplicaciones, equipo, credencial, espacio y otros recursos definidos por perfil.
- Cada acceso se basa en el puesto, nivel, área y salvaguardas de independencia autorizadas.
- Los accesos definitivos no se activan antes de la fecha o condición aprobada.
- La tarea registra recurso, responsable, estado, fecha y evidencia o identificador permitido.
- Las credenciales y contraseñas no se guardan en comentarios de tareas.
- En la primera entrega se controla la tarea; la creación automática de cuentas o integración con inventario queda para ampliación.

**Entrega propuesta:** Primera entrega para coordinación; automatización en ampliación.

#### HU-05-14. Preparar el primer día

**Historia:** Como responsable directo, quiero organizar el primer día para que el nuevo empleado sepa dónde presentarse, con quién y qué actividades tendrá.

**Criterios de aceptación propuestos:**

- Se registran modalidad, lugar o enlace, hora, contacto de recepción y agenda inicial.
- El responsable puede asignar una persona de apoyo o acompañamiento cuando la firma use esa práctica.
- Se pueden incluir presentación del equipo, inducción, entrega de equipo y capacitaciones iniciales sin duplicar el seguimiento detallado que corresponde a EP-07.
- Los datos de clientes o proyectos solo se muestran si el acceso ya fue autorizado.
- Los cambios relevantes se comunican al nuevo empleado y quedan registrados.

**Entrega propuesta:** Primera entrega.

#### HU-05-15. Confirmar el ingreso y activar el expediente

**Historia:** Como integrante autorizado de RR. HH., quiero confirmar que la persona se incorporó para activar su expediente y actualizar la plaza.

**Criterios de aceptación propuestos:**

- RR. HH. confirma la fecha real de ingreso mediante una acción expresa.
- La confirmación solo se permite cuando las condiciones que bloquean el ingreso están resueltas o existe una excepción aprobada y registrada.
- El expediente de EP-04 pasa a activo y conserva la relación con la oferta y la incorporación.
- EP-03 recibe la incorporación efectiva para marcar la plaza como cubierta y recalcular el estado de la vacante.
- Las tareas posteriores al primer día pueden permanecer abiertas sin impedir la confirmación si no son bloqueantes.
- Se registra quién confirmó, cuándo y cualquier diferencia respecto de la fecha prevista.

**Entrega propuesta:** Primera entrega.

#### HU-05-16. Cancelar una incorporación no completada

**Historia:** Como integrante de RR. HH., quiero cancelar la incorporación cuando la persona no se presenta o el ingreso deja de proceder para mantener expedientes y plazas correctos.

**Criterios de aceptación propuestos:**

- La cancelación exige fecha, motivo, responsable y referencia a la decisión o autorización correspondiente.
- Si la firma retira una oferta aceptada, se exige la aprobación de RR. HH. y un socio y se usa el texto aprobado por Legal, conforme a EP-03.
- Si la persona se retira o no se presenta, RR. HH. registra el hecho y la fecha.
- El expediente en preparación se cancela o inactiva sin borrar el historial; se revocan invitaciones, accesos preparados y tareas que ya no proceden.
- EP-03 recibe el resultado para reabrir la plaza o retomar otra candidatura.
- La conservación de documentos y comunicaciones sigue las reglas aplicables de EP-03 y la política laboral que se confirme.

**Entrega propuesta:** Primera entrega.

#### HU-05-17. Proteger y auditar datos de incorporación

**Historia:** Como responsable de control, quiero limitar y auditar el acceso a datos y documentos de incorporación para evitar exposición innecesaria.

**Criterios de aceptación propuestos:**

- Cada categoría de dato o documento define quién puede consultar, validar, modificar, descargar o exportar.
- RR. HH., Nómina, TI, jefatura y Cumplimiento reciben únicamente la información necesaria para su tarea.
- Las consultas, descargas, validaciones, cambios, firmas y exportaciones sensibles dejan usuario, fecha, acción y resultado.
- Los enlaces del paquete vencen o pueden revocarse y no permiten acceder a otra incorporación.
- Los archivos rechazados, reemplazados o de una incorporación cancelada siguen la conservación que confirme el cliente; no se eliminan ni conservan indefinidamente sin una regla.
- La bitácora no copia íntegramente documentos, credenciales o valores sensibles.

**Entrega propuesta:** Primera entrega.

### Reglas provenientes de épicas anteriores

| Tema | Decisión que debe respetar EP-05 |
| --- | --- |
| Inicio | EP-05 comienza después de aceptar la oferta. Puede iniciar de forma condicionada si queda una verificación permitida en curso. |
| Independencia | La declaración debe estar resuelta antes de emitir la oferta. Las salvaguardas aplicables pasan al expediente del empleado. |
| Datos transferidos | Se reciben datos personales y laborales, oferta final, estados permitidos de verificaciones, salvaguardas y documentos. No se reciben notas ni calificaciones. |
| Confirmación de plaza | Una oferta aceptada deja la plaza en incorporación; solo la incorporación efectiva la marca como cubierta. |
| Expediente | EP-04 exige un expediente único, evita duplicados y separa permisos técnicos de acceso a datos sensibles. |
| Trazabilidad | Las épicas anteriores requieren registro de consultas, exportaciones y cambios sensibles. |

### Decisiones pendientes para validar con el cliente

1. **Tipos de incorporación:** definir plantillas para técnicos, practicantes, administrativos, contrataciones temporales, reingresos y otros grupos.
2. **Datos y documentos:** confirmar el listado obligatorio por tipo de contratación, formatos, vigencia, responsables de validación y reglas aplicables en Guatemala.
3. **Firma:** identificar qué documentos requieren firma, confirmación de lectura o aceptación; definir mecanismo inicial y solución de firma electrónica.
4. **Responsables y plazos:** acordar las tareas exactas de RR. HH., TI, jefatura, Administración, Nómina, Cumplimiento y nuevo empleado, con fechas relativas al ingreso.
5. **Tareas vencidas:** definir recordatorios, escalamiento, responsables sustitutos y condiciones para dispensar o posponer tareas.
6. **Condiciones pendientes:** confirmar qué verificaciones pueden mantenerse abiertas tras aceptar la oferta, cuánto tiempo y quién autoriza una excepción.
7. **Criterios de activación:** distinguir las tareas que bloquean el ingreso de las que pueden completarse después del primer día.
8. **Cuentas y equipo:** definir catálogo por perfil, aprobaciones, fecha de activación, inventario e integraciones con directorio o mesa de servicio.
9. **Paquete de bienvenida:** confirmar contenido, remitente, preguntas de presentación, uso de fotografía, audiencia y disponibilidad desde celular.
10. **Primer día:** definir agenda mínima, responsables, modalidad, acompañamiento y tratamiento de cambios de última hora.
11. **Cancelaciones y reingresos:** acordar el cierre de tareas, revocación de accesos, tratamiento del expediente y posibilidad de reusar una incorporación.
12. **Privacidad y conservación:** validar con el asesor el acceso, finalidad y plazo de datos bancarios, identificación, emergencia, documentos firmados y archivos de incorporaciones canceladas.

### Criterio de éxito de la épica

Una oferta aceptada genera una incorporación controlada sin recaptura innecesaria. El nuevo empleado y cada área conocen sus tareas, RR. HH. distingue condiciones y bloqueos, y la firma confirma el ingreso solo cuando se cumplen los requisitos críticos. El expediente se activa, la plaza se actualiza y los datos sensibles permanecen restringidos y trazables.
