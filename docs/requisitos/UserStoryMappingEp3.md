# User Story Mapping — EP-03: Selección y contratación de candidatos

## Propósito

Este archivo desarrolla la tercera épica de las [épicas consolidadas](epicas_sistema_rrhh.md) con la misma estructura de [UserStoryMapping.md](UserStoryMapping.md) y [UserStoryMappingEp2.md](UserStoryMappingEp2.md). El mapa comienza con una postulación recibida en EP-02 y termina con la decisión de contratación, el estado de las plazas y el traspaso hacia EP-05.

Incorpora las decisiones comunicadas por el cliente, una firma de auditoría financiera con sede en Guatemala. Las reglas sobre datos personales, antecedentes, revisión crediticia, declaraciones de independencia y firma electrónica se registran como requisitos iniciales y quedan sujetas a la validación del asesor legal antes de considerarse definitivas.

**Convención:** `HU-03-01` identifica la historia 01 de la épica 03. Las entregas son una propuesta de prioridad, no fechas comprometidas.

## Avance por épica

| Épica | Nombre | Estado del mapping |
| --- | --- | --- |
| EP-01 | Portal del empleado y gestión de ausencias | [Desarrollada](UserStoryMapping.md#ep-01-portal-del-empleado-y-gestion-de-ausencias) |
| EP-02 | Creación y publicación de vacantes | [Actualizada con decisiones del cliente](UserStoryMappingEp2.md) |
| EP-03 | Selección y contratación de candidatos | Historias actualizadas con decisiones del cliente |
| EP-04 | Administración de empleados y estructura organizacional | [Historias propuestas para validación](UserStoryMappingEp4.md) |
| EP-05 | Incorporación de nuevos empleados | [Historias propuestas para validación](UserStoryMappingEp5.md) |
| EP-06 | Historial laboral y beneficios | [Historias propuestas para validación](UserStoryMappingEp6.md) |
| EP-07 | Documentos y capacitación | Pendiente |
| EP-08 | Objetivos y evaluaciones de desempeño | Pendiente |
| EP-09 | Reportes y análisis de satisfacción | Pendiente |
| EP-10 | Control de horas e información de nómina | [Historias propuestas para validación](UserStoryMappingEp10.md) |

---

## EP-03. Selección y contratación de candidatos

### Resultado que busca el usuario

RR. HH. y las personas autorizadas pueden revisar postulaciones, evaluar candidatos sin influir indebidamente en otras evaluaciones, coordinar entrevistas y verificaciones, resolver la independencia profesional, preparar una oferta aprobada y registrar la decisión final. El proceso conserva versiones, responsables y fechas, protege los datos restringidos y permite iniciar EP-05 cuando se cumplen las condiciones acordadas.

### Personas involucradas

- **Reclutador o personal de RR. HH.:** administra etapas, agenda entrevistas, ejecuta descartes, coordina verificaciones y comunicaciones, prepara y envía ofertas, y registra la decisión final.
- **Responsable de contratación:** consulta los candidatos de su vacante, participa en la evaluación y recomienda el avance a verificaciones, oferta, contratación o descarte.
- **Gerente del área:** decide junto con RR. HH. y aprueba ofertas según el nivel del puesto.
- **Socio:** ratifica decisiones para supervisor en adelante, aprueba ofertas según nivel y resuelve las excepciones indicadas por la firma.
- **Entrevistador adicional:** consulta únicamente la candidatura asignada, su CV, las respuestas del formulario y su propia evaluación; no ve expectativa salarial ni notas ajenas.
- **Cumplimiento / Independencia o socio designado:** revisa declaraciones de independencia y conflictos, registra el resultado y las salvaguardas.
- **Persona candidata:** participa en entrevistas, autoriza verificaciones, completa declaraciones y responde a la oferta.
- **Nuevo empleado:** al aceptar la oferta y cumplir las condiciones aplicables, pasa al proceso de incorporación de EP-05.

### Mapa de actividades e historias

Las columnas siguen el recorrido de una candidatura. La primera entrega cubre el proceso completo, incluida la independencia, las verificaciones y una alternativa inicial para aceptar la oferta sin depender de una integración de firma electrónica.

| Entrega | 1. Revisar | 2. Evaluar y entrevistar | 3. Verificar y decidir | 4. Comunicar y ofertar | 5. Contratar y cerrar |
| --- | --- | --- | --- | --- | --- |
| **Primera entrega** | [HU-03-01](#hu-03-01-consultar-candidatos-por-vacante), [HU-03-02](#hu-03-02-revisar-el-perfil-y-los-documentos), [HU-03-04](#hu-03-04-gestionar-las-etapas-y-el-descarte) | [HU-03-03](#hu-03-03-evaluar-con-rúbricas-y-notas), [HU-03-05](#hu-03-05-agendar-reprogramar-o-cancelar-entrevistas) | [HU-03-13](#hu-03-13-verificar-independencia-y-conflictos-de-interés), [HU-03-16](#hu-03-16-gestionar-verificaciones-del-candidato) | [HU-03-06](#hu-03-06-comunicarse-con-candidatos), [HU-03-07](#hu-03-07-consultar-el-historial-de-comunicaciones), [HU-03-08](#hu-03-08-preparar-versionar-y-aprobar-una-oferta), [HU-03-09](#hu-03-09-registrar-la-respuesta-y-las-contraofertas), [HU-03-14](#hu-03-14-administrar-plantillas-de-comunicación), [HU-03-15](#hu-03-15-aceptar-y-retirar-ofertas-de-forma-controlada) | [HU-03-10](#hu-03-10-registrar-la-contratación-y-transferir-a-ep-05), [HU-03-11](#hu-03-11-controlar-las-plazas-y-el-estado-de-la-vacante), [HU-03-12](#hu-03-12-resolver-las-candidaturas-no-seleccionadas), [HU-03-18](#hu-03-18-conservar-o-eliminar-datos-de-selección) |
| **Ampliación** | — | Invitaciones y archivo de calendario de [HU-03-05](#hu-03-05-agendar-reprogramar-o-cancelar-entrevistas), rúbricas configurables de [HU-03-03](#hu-03-03-evaluar-con-rúbricas-y-notas) | — | Buzón conectado y automatizaciones ampliadas de [HU-03-06](#hu-03-06-comunicarse-con-candidatos), administración avanzada de [HU-03-14](#hu-03-14-administrar-plantillas-de-comunicación), firma electrónica de [HU-03-15](#hu-03-15-aceptar-y-retirar-ofertas-de-forma-controlada) | [HU-03-17](#hu-03-17-administrar-un-banco-de-talento) |

### Historias de usuario

#### HU-03-01. Consultar candidatos por vacante

**Historia:** Como reclutador, quiero localizar las candidaturas de cada vacante para organizar su revisión sin mezclar procesos.

**Criterios de aceptación:**

- Cada candidatura muestra nombre, vacante, fecha de postulación, etapa actual y fuente declarada en EP-02.
- Se puede buscar por nombre y filtrar por vacante, etapa y estado activo o descartado.
- El sistema alerta a RR. HH. si la persona participa en otra vacante o si fue contratada o descartada antes; el motivo anterior solo es visible para RR. HH.
- Una misma persona puede participar en vacantes diferentes, pero cada candidatura mantiene su propio historial.
- El responsable de contratación solo ve candidatos de sus vacantes; los entrevistadores adicionales únicamente ven las candidaturas que se les asignen.
- Las consultas y exportaciones quedan registradas.

**Entrega:** Primera entrega.

#### HU-03-02. Revisar el perfil y los documentos

**Historia:** Como responsable de contratación, quiero revisar la información presentada por un candidato para determinar si cumple el perfil de la vacante.

**Criterios de aceptación:**

- La ficha presenta los datos, respuestas filtro y documentos enviados para la vacante correcta.
- Se distinguen la información aportada por la persona candidata, las observaciones internas y los datos restringidos.
- El responsable de contratación y RR. HH. pueden revisar CV y respuestas; la expectativa salarial mantiene la visibilidad establecida para el rol.
- Los archivos conservan la validación de tipo, tamaño y antivirus definida en EP-02.
- DPI, NIT, fotografía, estado civil, edad, religión y datos de salud no se incorporan como requisitos de revisión inicial.

**Entrega:** Primera entrega.

#### HU-03-03. Evaluar con rúbricas y notas

**Historia:** Como entrevistador autorizado, quiero evaluar con criterios comunes para fundamentar mi recomendación sin recibir influencia de notas ajenas.

**Criterios de aceptación:**

- La rúbrica se selecciona por grupo: técnico, practicante o administrativo y apoyo.
- La rúbrica técnica contempla auditoría y contabilidad, NIIF, NIA, análisis, comunicación, inglés, criterio profesional y ética; la de practicantes contempla potencial, actitud, comunicación y fundamentos académicos; la administrativa contempla competencias del puesto, comunicación, orden y servicio.
- Cada criterio usa escala de 1 a 5 con una descripción por nivel y una recomendación final: contratar con entusiasmo, contratar o no contratar.
- Una calificación de 1 o 2 y la recomendación no contratar exigen comentario.
- RR. HH. y el responsable de contratación ven todas las evaluaciones. El entrevistador solo ve la suya hasta enviarla; después puede ver el resumen consolidado únicamente si RR. HH. lo habilita.
- Un entrevistador adicional no ve expectativa salarial ni notas ajenas. Su acceso se retira al cerrar la vacante.
- Las notas son internas, se basan en la rúbrica y muestran guías de redacción profesional que evitan categorías sensibles o lenguaje inapropiado.
- La configuración editable de criterios y descripciones por RR. HH. puede incorporarse en una ampliación; la primera entrega ofrece las tres rúbricas acordadas.

**Entrega:** Primera entrega; configuración avanzada en ampliación.

#### HU-03-04. Gestionar las etapas y el descarte

**Historia:** Como integrante de RR. HH., quiero avanzar, retroceder o descartar una candidatura con reglas claras para conocer su situación y conservar la decisión.

**Criterios de aceptación:**

- Las etapas activas son: Postulado, Revisión de CV, Preselección, Entrevista con RR. HH., Evaluación técnica, Entrevista con el área, Verificaciones, Oferta y Contratado.
- Evaluación técnica puede omitirse para puestos administrativos y de apoyo. Retroceder una etapa exige justificación.
- RR. HH. avanza al candidato hasta Evaluación técnica. Pasar a Verificaciones u Oferta requiere recomendación del responsable de contratación.
- RR. HH. puede descartar hasta Entrevista con RR. HH. Desde Evaluación técnica, el responsable solicita el descarte y RR. HH. lo ejecuta.
- Descartar exige un motivo del catálogo: no cumple requisitos, expectativa salarial, retiro del candidato, resultado de evaluación, independencia u otros. «Otros» permite comentario y nunca se admiten motivos basados en edad, género, religión u otras categorías sensibles.
- El responsable recomienda. RR. HH. y el gerente del área toman la decisión; para puestos de supervisor en adelante, un socio la ratifica.
- Cada transición conserva etapa anterior, etapa nueva, responsable, fecha y justificación o motivo cuando corresponda.

**Entrega:** Primera entrega.

#### HU-03-05. Agendar, reprogramar o cancelar entrevistas

**Historia:** Como reclutador, quiero administrar la agenda de entrevistas para que participantes, modalidad y cambios queden registrados.

**Criterios de aceptación:**

- La agenda registra fecha, hora, modalidad, entrevistadores, enlace de videollamada o sala y candidatura asociada.
- Se puede reprogramar o cancelar, conservando el cambio y preparando un aviso para los participantes.
- En la primera entrega, RR. HH. registra la agenda y envía o registra el aviso desde el flujo de comunicación.
- En ampliación, el sistema envía invitaciones y archivos de calendario al candidato y entrevistadores; una integración con calendario corporativo es opcional.
- Solo los entrevistadores asignados obtienen el acceso limitado definido en HU-03-03.

**Entrega:** Agenda en primera entrega; invitaciones automáticas e integración en ampliación.

#### HU-03-06. Comunicarse con candidatos

**Historia:** Como reclutador, quiero comunicarme desde el proceso correcto para coordinar acciones y mantener mensajes consistentes.

**Criterios de aceptación:**

- Los mensajes salen de un buzón institucional de selección; el nombre visible puede ser el del reclutador.
- Antes del envío se revisan destinatario, asunto, texto, adjuntos y candidatura asociada.
- El reclutador puede ajustar invitaciones, solicitudes de documentos y avisos de avance. La oferta y el mensaje de descarte mantienen el texto aprobado.
- Los adjuntos permitidos son PDF, DOC y DOCX, hasta 10 MB en total, con revisión antivirus.
- La confirmación de postulación, el recordatorio 24 horas antes de la entrevista y el cierre por descarte pueden programarse automáticamente.
- El correo de descarte queda programado durante un plazo de revisión de RR. HH. antes de enviarse y no comunica el motivo interno detallado.
- Si el buzón conectado no está disponible al inicio, RR. HH. puede registrar una comunicación recibida por correo, llamada u otro canal con fecha, canal y resumen.
- WhatsApp no se envía desde el sistema, aunque una conversación externa puede registrarse manualmente.

**Entrega:** Primera entrega con envíos y registro manual; recepción automática mediante buzón conectado en ampliación.

#### HU-03-07. Consultar el historial de comunicaciones

**Historia:** Como integrante de RR. HH., quiero consultar todo contacto de una candidatura para responder con contexto y evitar mensajes contradictorios.

**Criterios de aceptación:**

- El historial muestra mensajes enviados, comunicaciones recibidas por el buzón conectado cuando exista y registros manuales de correo, llamada u otro canal.
- Cada elemento identifica fecha, usuario o remitente, canal, asunto o resumen, adjuntos y resultado del envío cuando aplique.
- Las comunicaciones registradas manualmente se distinguen de las sincronizadas.
- Solo RR. HH. consulta el historial completo; cualquier acceso o exportación conserva trazabilidad.
- El historial sigue la conservación aplicable a la candidatura.

**Entrega:** Primera entrega; sincronización del buzón en ampliación.

#### HU-03-08. Preparar, versionar y aprobar una oferta

**Historia:** Como integrante de RR. HH., quiero preparar una oferta y obtener las aprobaciones correspondientes para enviarla con condiciones autorizadas.

**Criterios de aceptación:**

- La carta usa una plantilla aprobada por RR. HH. y Legal con nombre, puesto, nivel, fecha de ingreso, jefe directo, salario, bonos y tipo de contrato.
- Los importes se expresan en quetzales. Puede mostrarse una referencia excepcional en dólares, pero el salario se fija en GTQ.
- Puede incluir salario base mensual, bonificación incentivo, bonificación 14, aguinaldo, bono variable cuando aplique, beneficios, período de prueba y contrato indefinido o a plazo fijo.
- El vencimiento predeterminado es de cinco días hábiles y RR. HH. puede ajustarlo.
- Técnicos hasta semi senior y administrativos requieren aprobación del gerente del área y RR. HH.; senior y supervisor requieren además un socio; gerente en adelante requiere dos socios. Una oferta fuera del rango interno requiere aprobación adicional de un socio.
- Solo RR. HH. envía una oferta aprobada.
- Los estados son: en preparación, pendiente de aprobación, aprobada, enviada, aceptada, rechazada, vencida y retirada.
- Cada versión se conserva. Cambiar salario, puesto, nivel u otro componente económico reinicia las aprobaciones; fecha de ingreso o corrección de redacción no las reinicia, pero deja registro.

**Entrega:** Primera entrega.

#### HU-03-09. Registrar la respuesta y las contraofertas

**Historia:** Como integrante de RR. HH., quiero registrar la respuesta y cualquier contraoferta para mantener la negociación vinculada a la versión correcta.

**Criterios de aceptación:**

- La aceptación, rechazo o vencimiento se asocia a una versión enviada y registra fecha, usuario y evidencia.
- Una contraoferta registra la solicitud del candidato y da origen a una versión posterior sin borrar las anteriores.
- Si una versión posterior cambia condiciones económicas, puesto o nivel, repite las aprobaciones de HU-03-08.
- El vencimiento no se interpreta como aceptación y una contraoferta no convierte al candidato en contratado.
- La oferta puede aceptarse con firma electrónica o enlace seguro; mientras esa función no esté disponible, RR. HH. puede cargar la carta firmada y escaneada.

**Entrega:** Primera entrega con carta escaneada; firma electrónica o enlace seguro en ampliación, sujeto a validación legal.

#### HU-03-10. Registrar la contratación y transferir a EP-05

**Historia:** Como integrante autorizado de RR. HH., quiero registrar una oferta aceptada y transferir los datos permitidos a EP-05 para iniciar la incorporación de manera controlada.

**Criterios de aceptación:**

- La contratación identifica candidato, vacante, plaza, versión aceptada, fecha prevista de ingreso, responsables de la decisión y fecha.
- La autorización ocurre antes de enviar la oferta: RR. HH. y gerente del área, más los socios exigidos por nivel en HU-03-08.
- EP-05 inicia cuando la oferta se acepta y no quedan verificaciones o declaración de independencia pendientes.
- Si queda una verificación permitida en curso, la aceptación puede registrarse sujeta a condición y EP-05 puede iniciar, pero el ingreso no se confirma hasta resolverla. La independencia no puede quedar pendiente para emitir la oferta.
- Se transfieren datos personales y de contacto, puesto, nivel, área, jefe, fecha de ingreso, salario aprobado, oferta final firmada, estado de verificaciones, salvaguardas de independencia y documentos entregados.
- No se transfieren notas de entrevista ni calificaciones. De antecedentes y referencias pasa solo el resultado permitido, no el detalle.
- Si la persona ya posee un expediente, el sistema alerta antes de crear otro.

**Entrega:** Primera entrega.

#### HU-03-11. Controlar las plazas y el estado de la vacante

**Historia:** Como integrante de RR. HH., quiero controlar cuántas plazas tiene la vacante y su estado para gestionar contrataciones individuales o grupales.

**Criterios de aceptación:**

- Cada vacante indica número total de plazas y conteos de pendientes, con oferta aceptada, en incorporación e incorporadas.
- Puede existir una oferta por plaza y varias ofertas simultáneas para una misma vacante.
- Una oferta aceptada deja la plaza en proceso de incorporación; la plaza se considera cubierta cuando la persona se incorpora.
- La vacante pasa a cubierta cuando todas sus plazas están cubiertas. Antes de eso puede permanecer abierta, pausarse o cerrarse por decisión expresa de RR. HH.
- Si la persona no se incorpora, RR. HH. registra fecha y motivo, cancela el expediente iniciado en EP-05 y puede reabrir la plaza o retomar otra candidatura.
- Al cerrar, cubrir o cancelar la vacante, el sistema recuerda actualizar o retirar los anuncios externos registrados en EP-02.

**Entrega:** Primera entrega.

#### HU-03-12. Resolver las candidaturas no seleccionadas

**Historia:** Como reclutador, quiero cerrar y comunicar las candidaturas que no continúan para que el proceso no quede indefinido.

**Criterios de aceptación:**

- El descarte conserva etapa, fecha, responsable y motivo interno del catálogo definido en HU-03-04.
- El mensaje externo usa texto aprobado, no revela notas ni el motivo interno y queda sujeto al plazo de revisión de RR. HH.
- Cuando la vacante se cubre o cierra, los candidatos desde Entrevista con el área reciben comunicación personalizada de RR. HH.; los demás reciben el mensaje de cierre programado.
- La decisión sobre una candidatura no cambia automáticamente las demás ni borra su historial.
- Quienes autorizaron futuras vacantes pueden pasar al banco de talento; los demás siguen la política de conservación de EP-02 y HU-03-18.

**Entrega:** Primera entrega.

#### HU-03-13. Verificar independencia y conflictos de interés

**Historia:** Como integrante de Cumplimiento o socio designado, quiero revisar la independencia del candidato para impedir una oferta incompatible con las obligaciones de la firma.

**Criterios de aceptación:**

- Todo personal técnico, incluidos practicantes de auditoría, completa la declaración amplia; administrativos y apoyo completan una declaración reducida de conflictos.
- La declaración técnica contempla intereses financieros en clientes, parentescos, empleo previo o actual en clientes o relacionadas, relaciones comerciales o préstamos y otros conflictos relevantes.
- Se solicita después de Entrevista con el área y antes de emitir la oferta.
- Cumplimiento / Independencia o un socio designado revisa el detalle con apoyo de RR. HH. El responsable de contratación solo ve el resultado.
- Los resultados son: sin conflicto, conflicto manejable con salvaguardas o conflicto que impide la contratación.
- No se emite una oferta mientras la declaración esté incompleta o sin revisar. Un conflicto impeditivo bloquea el avance y solo una decisión escrita de un socio puede levantarlo.
- Las salvaguardas quedan registradas y, si se contrata, pasan al expediente de independencia en EP-05.
- Toda consulta, modificación y resultado conserva trazabilidad.

**Entrega:** Primera entrega, sujeta a validación legal de contenido, acceso y conservación.

#### HU-03-14. Administrar plantillas de comunicación

**Historia:** Como responsable de RR. HH., quiero mantener plantillas aprobadas para que las comunicaciones sean consistentes y revisables.

**Criterios de aceptación:**

- Existen plantillas en español para confirmación de postulación, entrevista, solicitud de documentos o autorización, avance, cierre del proceso y oferta.
- Solo RR. HH. edita las plantillas generales; se conserva quién cambió cada una y cuándo.
- Antes de enviar se completan y revisan los datos variables obligatorios.
- El reclutador puede ajustar el texto cuando la regla de HU-03-06 lo permita; oferta y descarte mantienen el contenido aprobado.
- La firma puede activar el recordatorio automático de entrevista 24 horas antes.

**Entrega:** Plantillas base en primera entrega; administración avanzada y más automatizaciones en ampliación.

#### HU-03-15. Aceptar y retirar ofertas de forma controlada

**Historia:** Como integrante de RR. HH., quiero obtener una aceptación verificable o retirar una oferta con autorización para conservar una resolución válida y trazable.

**Criterios de aceptación:**

- El candidato puede aceptar mediante firma electrónica o enlace seguro cuando la solución esté habilitada; inicialmente se admite una carta firmada y escaneada cargada por RR. HH.
- La evidencia se vincula al candidato, la vacante y la versión exacta de la oferta.
- Retirar una oferta aceptada por decisión de la firma requiere aprobación de RR. HH. y un socio, motivo obligatorio y comunicación con texto aprobado por Legal.
- Todo cambio de estado conserva usuario, fecha y versión.
- La validez de la firma electrónica y la evidencia mínima se confirman con el asesor legal.

**Entrega:** Retiro controlado y carta escaneada en primera entrega; firma electrónica en ampliación.

#### HU-03-16. Gestionar verificaciones del candidato

**Historia:** Como integrante de RR. HH., quiero coordinar las verificaciones aplicables al puesto para resolverlas con autorización y acceso restringido.

**Criterios de aceptación:**

- Para técnicos se contemplan dos referencias laborales, certificaciones y colegiado cuando fueron declarados, títulos, antecedentes penales y policiacos, y revisión crediticia solo si manejan fondos o información sensible.
- Para practicantes se contempla referencia académica, constancia de estudios y antecedentes. Para administrativos se contemplan referencias, estudios según el puesto, antecedentes y revisión crediticia cuando corresponda.
- Antecedentes y revisión crediticia solo se solicitan después de Entrevista con el área y con autorización escrita del candidato.
- Cada verificación registra tipo, estado pendiente, en curso, completada o con observaciones, responsable, fecha y resultado.
- Solo RR. HH. ve hallazgos y documentos detallados. El resultado de antecedentes se evalúa según el puesto y no produce descarte automático.
- Para una persona contratada, solo el estado o resultado permitido pasa a EP-05, sin trasladar el detalle restringido.

**Entrega:** Primera entrega, sujeta a validación legal de autorizaciones, fuentes, acceso y conservación.

#### HU-03-17. Administrar un banco de talento

**Historia:** Como reclutador, quiero localizar candidatos que autorizaron futuras vacantes para considerar perfiles previos sin usar datos contra su consentimiento.

**Criterios de aceptación:**

- Solo ingresan candidatos con la autorización opcional y separada de EP-02 vigente.
- RR. HH. puede buscar por experiencia, formación, certificaciones y puestos de interés sin exponer notas o datos restringidos como criterio general.
- Contactar a la persona para otra vacante crea o vincula una candidatura nueva y conserva el origen banco de talento.
- Revocar la autorización o vencer su plazo retira el perfil del banco y activa el tratamiento definido en HU-02-16.

**Entrega:** Ampliación.

#### HU-03-18. Conservar o eliminar datos de selección

**Historia:** Como responsable de RR. HH., quiero aplicar plazos por tipo de dato y atender solicitudes de eliminación para reducir exposición y conservar la trazabilidad permitida.

**Criterios de aceptación:**

- Para no contratados, notas y evaluaciones, referencias, ofertas no aceptadas y declaraciones de independencia se proponen por 12 meses desde el cierre de la vacante; comunicaciones siguen el plazo de la candidatura.
- Al cerrar una verificación de antecedentes o revisión crediticia, se elimina el documento o detalle y solo se conserva el resultado permitido: apto, apto con observaciones o no apto.
- Para contratados, la oferta aceptada y los resultados permitidos pasan al expediente; la declaración de independencia pasa al expediente correspondiente y sigue la norma de la firma que valide el asesor.
- RR. HH. registra y atiende solicitudes de eliminación. El plazo propuesto es 30 días, sujeto a validación legal.
- Tras eliminar datos personales, puede conservarse un registro mínimo anonimizado de que existió una candidatura y su resultado para estadísticas y trazabilidad.
- Si existe una obligación legal o disputa abierta, se retiene únicamente lo necesario, se documenta la excepción y se informa al solicitante según el procedimiento validado.
- Se registra quién consultó, exportó o modificó evaluaciones, verificaciones, declaraciones y ofertas.

**Entrega:** Primera entrega para clasificación, permisos, trazabilidad y ejecución controlada; plazos y excepciones sujetos a validación legal.

### Reglas confirmadas por el cliente

| Tema | Decisión registrada |
| --- | --- |
| Etapas | Postulado, Revisión de CV, Preselección, Entrevista con RR. HH., Evaluación técnica, Entrevista con el área, Verificaciones, Oferta y Contratado. Descartado puede ocurrir desde cualquier etapa. |
| Decisión | El responsable de contratación recomienda; RR. HH. y el gerente deciden. Supervisor en adelante requiere ratificación de un socio. |
| Evaluación | Tres rúbricas por grupo, escala de 1 a 5, recomendación final y comentarios obligatorios en puntuaciones bajas o no contratar. |
| Entrevistadores | Acceso limitado a candidatura asignada y evaluación propia; sin expectativa salarial ni notas ajenas. |
| Verificaciones | Se definen por grupo de puesto. Antecedentes y revisión crediticia requieren autorización escrita y acceso restringido. |
| Independencia | Obligatoria antes de la oferta; Cumplimiento o socio designado revisa. Un conflicto impeditivo bloquea la contratación salvo decisión escrita de un socio. |
| Comunicaciones | Buzón institucional, plantillas aprobadas, adjuntos controlados e historial. Descarte programado con revisión previa. |
| Oferta | GTQ, vencimiento predeterminado de cinco días hábiles, aprobaciones por nivel, versiones y repetición de aprobaciones cuando cambian condiciones relevantes. |
| Traspaso | EP-05 inicia tras aceptación y condiciones aplicables. No se transfieren notas ni calificaciones. |
| Plazas | Una vacante puede contener varias plazas; cada plaza tiene su oferta y solo queda cubierta tras la incorporación. |

### Precisiones aún necesarias

1. **Revisión legal:** validar conservación de antecedentes y revisión crediticia, acceso del candidato a notas, validez de firma electrónica, declaraciones de independencia, plazo de 30 días y excepciones por disputa u obligación legal.
2. **Descripciones de escala:** RR. HH. debe proporcionar la definición exacta de los niveles 1 a 5 para cada rúbrica.
3. **Plazo de revisión del descarte:** falta definir cuántas horas o días permanece programado el mensaje antes de enviarse.
4. **Fuentes de verificación:** falta identificar proveedores o responsables, documentos válidos y procedimiento de autorización escrita.
5. **Contratación condicionada:** falta definir qué verificaciones pueden quedar pendientes después de aceptar la oferta y cuál es el plazo máximo para resolverlas.
6. **Firma e integraciones:** se debe seleccionar el mecanismo de firma electrónica, el buzón institucional y, si se desea, la integración de calendario.
7. **Norma de independencia:** Cumplimiento debe confirmar el plazo del expediente de independencia de contratados y el proceso para la decisión escrita que levanta un bloqueo.

### Criterio de éxito de la épica

La firma puede seguir cada candidatura desde Postulado hasta Contratado o Descartado, con evaluaciones independientes, verificaciones e independencia resueltas, comunicaciones trazables y una oferta autorizada y versionada. Una aceptación válida puede iniciar EP-05 sin trasladar notas internas, mientras RR. HH. conserva el control de las plazas, las candidaturas restantes y los datos sujetos a eliminación.
