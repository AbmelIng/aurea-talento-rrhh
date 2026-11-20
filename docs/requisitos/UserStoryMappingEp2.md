# User Story Mapping — EP-02: Creación y publicación de vacantes

## Propósito

Este archivo desarrolla la segunda épica de las [épicas consolidadas](epicas_sistema_rrhh.md) con la misma estructura utilizada en [UserStoryMapping.md](UserStoryMapping.md). El mapa sigue el recorrido desde la requisición de una plaza hasta la publicación y recepción de postulaciones. Incorpora las decisiones comunicadas por el cliente, una firma de auditoría financiera con sede en Guatemala. Las reglas sobre datos personales y conservación quedan sujetas a la revisión de su asesor antes de considerarse definitivas.

**Convención:** `HU-02-01` identifica la historia 01 de la épica 02. Las entregas son una propuesta de prioridad para discutir con el cliente, no fechas comprometidas.

## Avance por épica

| Épica | Nombre | Estado del mapping |
| --- | --- | --- |
| EP-01 | Portal del empleado y gestión de ausencias | [Desarrollada](UserStoryMapping.md#ep-01-portal-del-empleado-y-gestion-de-ausencias) |
| EP-02 | Creación y publicación de vacantes | Historias actualizadas con decisiones del cliente |
| EP-03 | Selección y contratación de candidatos | [Actualizada con decisiones del cliente](UserStoryMappingEp3.md) |
| EP-04 | Administración de empleados y estructura organizacional | [Historias propuestas para validación](UserStoryMappingEp4.md) |
| EP-05 | Incorporación de nuevos empleados | [Historias propuestas para validación](UserStoryMappingEp5.md) |
| EP-06 | Historial laboral y beneficios | [Historias propuestas para validación](UserStoryMappingEp6.md) |
| EP-07 | Documentos y capacitación | Pendiente |
| EP-08 | Objetivos y evaluaciones de desempeño | Pendiente |
| EP-09 | Reportes y análisis de satisfacción | Pendiente |
| EP-10 | Control de horas e información de nómina | [Historias propuestas para validación](UserStoryMappingEp10.md) |

---

## EP-02. Creación y publicación de vacantes

### Resultado que busca el usuario

Un gerente o socio puede solicitar una plaza; RR. HH. prepara una vacante, obtiene las aprobaciones necesarias y la publica en una página de empleos propia. La persona candidata puede consultarla y postularse desde el celular. El seguimiento y la evaluación posterior de candidatos corresponden a EP-03.

### Personas involucradas

- **Gerente o socio solicitante:** envía la requisición con justificación y motivo de la plaza.
- **Responsable de contratación:** revisa la vacante y consulta sus candidatos; no modifica la publicación directamente. Confirma cambios de fondo cuando corresponda.
- **Gerente del área, RR. HH. y socio:** aprueban la publicación según se trate de reemplazo o plaza nueva.
- **Reclutador o personal de RR. HH.:** crea y edita borradores. Solo RR. HH. publica, modifica vacantes abiertas y las retira o cierra.
- **Persona candidata:** consulta vacantes abiertas y responde al formulario de postulación.
- **Administrador del sistema:** configura permisos y catálogos; no adquiere por ese hecho acceso a los datos de candidatos.

### Mapa de actividades e historias

Las columnas representan las actividades del recorrido. Las filas proponen cortes de entrega acumulativos. La primera entrega cubre el flujo desde la necesidad de personal hasta una postulación recibida y protegida.

| Entrega | 1. Solicitar y localizar | 2. Preparar el puesto | 3. Diseñar la postulación | 4. Aprobar y publicar | 5. Difundir y recibir |
| --- | --- | --- | --- | --- | --- |
| **Primera entrega** | [HU-02-13](#hu-02-13-solicitar-y-aprobar-una-requisición-de-vacante), [HU-02-01](#hu-02-01-consultar-y-filtrar-vacantes) | [HU-02-02](#hu-02-02-crear-una-vacante-en-borrador), [HU-02-03](#hu-02-03-definir-el-contenido-y-la-ubicación-de-la-vacante) | [HU-02-04](#hu-02-04-configurar-preguntas-y-documentos-estándar), [HU-02-05](#hu-02-05-añadir-preguntas-personalizadas), [HU-02-07](#hu-02-07-revisar-la-vacante-antes-de-publicarla) | [HU-02-08](#hu-02-08-publicar-la-vacante-en-el-sitio-de-empleos), [HU-02-14](#hu-02-14-ofrecer-una-página-pública-de-empleos), [HU-02-12](#hu-02-12-actualizar-o-retirar-una-vacante) | [HU-02-09](#hu-02-09-compartir-el-enlace-directo), [HU-02-11](#hu-02-11-recibir-una-postulación), [HU-02-15](#hu-02-15-registrar-la-difusión-manual-y-la-fuente-de-candidatos), [HU-02-16](#hu-02-16-conservar-o-eliminar-datos-de-candidatos) |
| **Ampliación** | — | — | [HU-02-06](#hu-02-06-reutilizar-preguntas-anteriores) | — | [HU-02-17](#hu-02-17-insertar-vacantes-en-el-sitio-institucional) |
| **Sujeta a integración** | — | — | — | — | [HU-02-10](#hu-02-10-difundir-vacantes-en-portales-externos) |

### Historias de usuario

#### HU-02-01. Consultar y filtrar vacantes

**Historia:** Como reclutador, quiero consultar las vacantes y filtrar por estado para localizar rápidamente el puesto en el que trabajaré.

**Criterios de aceptación propuestos:**

- El listado muestra al menos título, ubicación, responsable de contratación, fecha de creación y estado.
- Se pueden distinguir y filtrar los estados borrador, pendiente de aprobación, aprobada, abierta, en pausa, cerrada, cubierta y cancelada.
- La cantidad de postulaciones recibidas se muestra cuando exista ese dato y enlaza al proceso de EP-03.
- El responsable de contratación ve las vacantes de su área y sus candidatos sin permiso para editar la publicación. RR. HH. accede conforme a su función; otros gerentes no ven los datos de candidatos de una vacante ajena.

**Entrega propuesta:** Primera entrega.

#### HU-02-02. Crear una vacante en borrador

**Historia:** Como reclutador, quiero crear una vacante en borrador para preparar su contenido antes de hacerla pública.

**Criterios de aceptación propuestos:**

- RR. HH. o un reclutador autorizado crea el borrador a partir de una requisición identificable; el borrador no aparece en el sitio público.
- El borrador conserva lo capturado aunque todavía falten datos exigidos para publicar.
- Se registra quién lo creó y cuándo; solo RR. HH. o el reclutador autorizado pueden editarlo.
- El reclutador puede volver al borrador desde el listado de vacantes.

**Entrega propuesta:** Primera entrega.

#### HU-02-03. Definir el contenido y la ubicación de la vacante

**Historia:** Como reclutador de RR. HH., quiero describir el puesto solicitado y separar los datos internos de los públicos para que la publicación represente la oportunidad sin revelar información reservada.

**Criterios de aceptación propuestos:**

- Antes de solicitar aprobación se exigen título, área, responsable de contratación, tipo de empleo, nivel o categoría, número de plazas, experiencia mínima, descripción y responsabilidades, requisitos de formación y certificaciones, ubicación, modalidad y fecha límite de postulación.
- Los tipos de empleo contemplan tiempo completo, medio tiempo, plazo fijo y práctica profesional. Los niveles contemplan practicante, auditor junior, semi senior, senior, supervisor y gerente.
- La ubicación utiliza país Guatemala, departamento, municipio y ciudad cuando corresponda; no exige estados, provincias ni códigos postales de otros países. Para una práctica profesional, la experiencia mínima se registra como «no requerida».
- Se pueden registrar idiomas, disponibilidad para viajar y certificaciones deseables como datos opcionales.
- Código de puesto, centro de costo, rango salarial interno, motivo de la plaza y nombre de la persona reemplazada, cuando aplique, permanecen internos y nunca aparecen en la página pública.
- La compensación ofrecida por la firma no se publica; el formulario de postulación sí solicita la expectativa salarial del candidato.

**Entrega propuesta:** Primera entrega.

#### HU-02-04. Configurar preguntas y documentos estándar

**Historia:** Como reclutador, quiero elegir los datos y documentos de la postulación para recibir la información necesaria para evaluar el puesto.

**Criterios de aceptación propuestos:**

- En todos los puestos son obligatorios nombre completo, correo, teléfono, municipio y departamento de residencia, currículum, formación académica, expectativa salarial y disponibilidad para iniciar.
- Enlace profesional y carta de presentación son opcionales; las referencias laborales se solicitan después, durante la entrevista.
- Para puestos técnicos se pueden pedir colegiado activo, certificaciones, nivel de inglés y disponibilidad para viajar. Para practicantes se puede pedir constancia universitaria y cierre de pensum, sin exigir experiencia. Los puestos administrativos y de apoyo usan los documentos mínimos definidos por RR. HH.
- En la postulación inicial no se piden DPI, NIT, fotografía, estado civil, edad, religión ni datos de salud.
- La configuración y el formulario público muestran las mismas etiquetas, condiciones por tipo de puesto y reglas de obligatoriedad.

**Entrega propuesta:** Primera entrega.

#### HU-02-05. Añadir preguntas personalizadas

**Historia:** Como reclutador, quiero agregar preguntas específicas a una vacante para recoger información relevante que no aparece entre los campos estándar.

**Criterios de aceptación propuestos:**

- En la primera entrega se pueden crear preguntas de respuesta corta, sí/no y opción múltiple, incluidas preguntas filtro sobre colegiado activo o disponibilidad para viajar.
- Para cada pregunta se define el enunciado, las opciones cuando correspondan y si la respuesta es obligatoria.
- La vista del candidato presenta la pregunta con el tipo de respuesta configurado y valida las obligatorias.
- Las preguntas pertenecen a la vacante para la que fueron configuradas.

**Entrega propuesta:** Primera entrega. Respuesta larga, casilla y carga de archivo como tipos de pregunta personalizados pueden añadirse después; el currículum estándar sí admite archivo desde el inicio.

#### HU-02-06. Reutilizar preguntas anteriores

**Historia:** Como reclutador, quiero reutilizar preguntas ya creadas para preparar vacantes similares con menos trabajo.

**Criterios de aceptación propuestos:**

- Se pueden buscar y seleccionar preguntas previamente utilizadas.
- Al incorporarlas a una vacante, se puede revisar su texto, tipo y obligatoriedad antes de publicar.
- Cambiar una pregunta en la vacante actual no altera las postulaciones ya enviadas a otras vacantes.

**Entrega propuesta:** Ampliación.

#### HU-02-07. Revisar la vacante antes de publicarla

**Historia:** Como responsable de contratación, quiero revisar la publicación y su formulario para corregir errores antes de abrirla a candidatos.

**Criterios de aceptación propuestos:**

- La revisión muestra el contenido público, la ubicación y todas las preguntas que responderá el candidato.
- El sistema señala campos requeridos incompletos antes de permitir la publicación.
- El responsable de contratación puede revisar la vacante sin editar la publicación directamente; comunica correcciones a RR. HH.
- RR. HH. puede volver al borrador y corregir el contenido antes de enviarlo a aprobación.

**Entrega propuesta:** Primera entrega.

#### HU-02-08. Publicar la vacante en el sitio de empleos

**Historia:** Como integrante autorizado de RR. HH., quiero publicar una vacante aprobada para que pueda consultarse y recibir postulaciones desde la página de empleos de la firma.

**Criterios de aceptación propuestos:**

- La vacante pasa de borrador a pendiente de aprobación y luego a aprobada solo tras las decisiones exigidas en HU-02-13.
- Solo RR. HH. puede cambiar de aprobada a abierta; no se publica una vacante incompleta ni pendiente de aprobación.
- Al abrirla, el puesto y su formulario quedan accesibles en la página de empleos y mediante un enlace directo.
- Las vacantes en borrador, pendientes o aprobadas aún no son públicas y no admiten postulaciones.
- Se conserva quién aprobó y quién publicó, con las fechas correspondientes.

**Entrega propuesta:** Primera entrega.

**Regla confirmada:** La publicación exige aprobación del gerente solicitante y de RR. HH.; si la plaza es nueva, también de un socio.

#### HU-02-09. Compartir el enlace directo

**Historia:** Como integrante de RR. HH., quiero obtener un enlace directo y el texto de una vacante abierta para compartirlos por correo, redes y portales que gestionamos manualmente.

**Criterios de aceptación propuestos:**

- Se puede copiar un enlace que lleva a la vacante abierta correcta y un texto de publicación sin campos internos.
- El enlace refleja los cambios aprobados en la vacante propia.
- Al cerrarse, cubrirse o cancelarse la vacante, el enlace muestra que ya no está disponible y ofrece consultar otras vacantes abiertas; no permite nuevas postulaciones.

**Entrega propuesta:** Primera entrega. La inserción en el sitio institucional se detalla en HU-02-17.

#### HU-02-10. Difundir vacantes en portales externos

**Historia:** Como integrante de RR. HH., quiero publicar una vacante mediante una integración con portales externos para evitar la recaptura cuando exista un acuerdo y una conexión disponible.

**Criterios de aceptación propuestos:**

- Solo aparecen como seleccionables los portales que la organización tenga habilitados.
- Antes de enviar, el reclutador conoce qué información se compartirá con cada portal.
- El sistema informa si el envío fue aceptado, quedó pendiente o falló, sin presentar un fallo como publicación exitosa.
- Se conserva qué canal se seleccionó y el resultado del intento de publicación.

**Entrega propuesta:** Futuro, sujeto a acuerdos y acceso a las API. En la primera entrega la difusión en LinkedIn, Computrabajo, Tecoloco y bolsas universitarias es manual y se cubre con HU-02-15.

#### HU-02-11. Recibir una postulación

**Historia:** Como persona candidata, quiero completar el formulario de una vacante abierta para enviar mi postulación y saber que fue recibida.

**Criterios de aceptación propuestos:**

- La persona candidata ve la descripción del puesto y únicamente las preguntas configuradas para esa vacante.
- No puede enviar el formulario si falta una respuesta obligatoria, un archivo requerido o la aceptación obligatoria para tratar sus datos en ese proceso.
- El formulario presenta el aviso de privacidad en español y una casilla **separada y opcional** para conservar datos con fines de futuras vacantes.
- Solo acepta PDF, DOC o DOCX, hasta 5 MB por archivo y hasta tres archivos por postulación. Los archivos se revisan contra virus antes de quedar almacenados.
- Se solicita que indique cómo se enteró de la vacante, para atribuir la fuente.
- Si ya existe una postulación con el mismo correo para la misma vacante, el sistema no crea un duplicado y explica al candidato qué ocurrió.
- Al enviarla, la postulación queda asociada a la vacante correcta y el candidato recibe un correo de confirmación con el nombre del puesto.
- Solo RR. HH. y el responsable de contratación de esa vacante pueden consultar sus datos; se registra quién los consulta o exporta.

**Entrega propuesta:** Primera entrega.

**Dependencia:** El tratamiento y conservación de datos se detallan en HU-02-16 y están sujetos a la revisión del asesor del cliente.

#### HU-02-12. Actualizar o retirar una vacante

**Historia:** Como integrante autorizado de RR. HH., quiero actualizar, pausar, cerrar, cubrir, cancelar o reabrir una vacante para mantener vigente la información y controlar cuándo se reciben postulaciones.

**Criterios de aceptación propuestos:**

- RR. HH. edita una vacante abierta. Los cambios de requisitos, nivel, ubicación, modalidad o compensación interna requieren confirmación del responsable de contratación; una corrección menor no la requiere. Todos los cambios quedan registrados.
- Una vacante en pausa sigue visible, pero no recibe nuevas postulaciones. Cerrada, cubierta o cancelada tampoco recibe postulaciones y muestra una indicación comprensible; el cierre registra motivo.
- RR. HH. puede reabrir una vacante en pausa o cerrada, dejando usuario, fecha, motivo y cualquier cambio en la fecha límite.
- Al llegar la fecha límite, el sistema avisa a RR. HH.; solo se cierra si RR. HH. lo confirma.
- La vacante conserva el número total de plazas y muestra cuántas están pendientes, con oferta aceptada, en incorporación e incorporadas. Una plaza se considera cubierta cuando la persona se incorpora; la vacante queda cubierta cuando todas sus plazas lo están.
- Una oferta aceptada o una plaza cubierta no cierra automáticamente la publicación; RR. HH. decide si la mantiene abierta, la pausa o la cierra desde el flujo de EP-03.
- La página y el enlace propios reflejan los cambios de inmediato. Si hay portales externos registrados, se avisa a RR. HH. que podrían requerir una actualización o retirada manual.
- Las postulaciones existentes siguen vinculadas. El sistema no notifica cambios a candidatos anteriores salvo que RR. HH. decida comunicar un cambio importante.

**Entrega propuesta:** Primera entrega.

**Regla confirmada:** El sistema no actualiza automáticamente los portales externos durante la primera etapa.

#### HU-02-13. Solicitar y aprobar una requisición de vacante

**Historia:** Como gerente o socio, quiero solicitar una plaza y obtener las aprobaciones correspondientes antes de publicarla para justificar la necesidad y controlar su impacto presupuestario.

**Criterios de aceptación propuestos:**

- La requisición identifica puesto, área, responsable, justificación y si se trata de plaza nueva o reemplazo. Un reemplazo identifica internamente a la persona sustituida cuando corresponda.
- El gerente o socio del área puede presentarla. RR. HH. o el reclutador autorizado prepara el borrador vinculado a esa requisición.
- Para autorizar la publicación se requiere decisión del gerente del área solicitante y de RR. HH.; una plaza nueva requiere además la de un socio.
- Mientras faltan decisiones, la vacante está pendiente de aprobación; al completarse, pasa a aprobada y queda lista para que RR. HH. la publique.
- Cada decisión conserva autor, fecha y resultado; un rechazo devuelve la requisición o el borrador para corrección sin publicar la vacante.

**Entrega propuesta:** Primera entrega.

**Precisión pendiente:** Debe definirse si el gerente que solicitó la vacante puede aprobar su propia requisición y si un rechazo reinicia todas las aprobaciones después de corregirla.

#### HU-02-14. Ofrecer una página pública de empleos

**Historia:** Como persona candidata, quiero encontrar las vacantes de la firma en una página pública clara para consultar oportunidades y postularme desde mi celular.

**Criterios de aceptación propuestos:**

- La página pública pertenece al sistema, usa logo y colores de la firma, está en español y funciona en celular.
- La lista pública muestra las vacantes abiertas y permite abrir una página específica por puesto.
- Las vacantes abiertas y sus páginas pueden ser indexadas por motores de búsqueda; los estados internos y los campos reservados no se publican.
- Una vacante en pausa puede verse desde su enlace, pero indica que temporalmente no recibe postulaciones. Una cerrada o cancelada informa que ya no está disponible y ofrece otras vacantes abiertas.
- La página no depende de que el sitio institucional tenga una sección de empleos.

**Entrega propuesta:** Primera entrega.

#### HU-02-15. Registrar la difusión manual y la fuente de candidatos

**Historia:** Como integrante de RR. HH., quiero registrar dónde y cuándo difundí cada vacante para recordar publicaciones externas y conocer de qué canales llegan candidatos.

**Criterios de aceptación propuestos:**

- RR. HH. puede registrar canal, enlace externo cuando exista y fecha de publicación manual para cada vacante.
- Los canales iniciales contemplan LinkedIn, Computrabajo, Tecoloco, bolsas universitarias y otros que RR. HH. identifique. Las bolsas universitarias pueden gestionarse por correo.
- El formulario de postulación pregunta al candidato cómo se enteró de la vacante y conserva la respuesta para reportes futuros.
- Al actualizar una vacante abierta se muestran los canales registrados que podrían tener información desactualizada; al cerrarla o cancelarla se recuerda retirar los anuncios manuales.
- El registro manual no presenta la publicación externa como una integración automática.

**Entrega propuesta:** Primera entrega.

#### HU-02-16. Conservar o eliminar datos de candidatos

**Historia:** Como integrante de RR. HH., quiero aplicar la política de conservación y atender solicitudes de eliminación para limitar el acceso y mantener trazabilidad sobre los datos de candidatos.

**Criterios de aceptación propuestos:**

- Se registra por separado la aceptación necesaria para el proceso actual y la autorización opcional para considerar al candidato en futuras vacantes.
- Para candidatos no contratados sin autorización futura, los datos se eliminan o anonimizan a los 12 meses desde el cierre de la vacante. Con autorización futura, el máximo informado por el cliente es 24 meses.
- Cuando un candidato es contratado, los datos pertinentes pasan al expediente del empleado según el flujo de EP-03 y EP-05; la conservación posterior sigue la política laboral aplicable.
- RR. HH. puede registrar y atender una solicitud de eliminación, dejando fecha, responsable, decisión y resultado.
- El acceso y la exportación de datos de candidatos quedan limitados a RR. HH. y al responsable de esa vacante; cada consulta o exportación deja una huella de auditoría.
- Al cumplirse el plazo, el sistema identifica los registros que deben eliminarse o anonimizarse y deja constancia de la ejecución.

**Entrega propuesta:** Primera entrega para consentimiento, permisos y registro de accesos; la ejecución definitiva de plazos y eliminación depende de la revisión del asesor del cliente.

#### HU-02-17. Insertar vacantes en el sitio institucional

**Historia:** Como responsable del sitio institucional, quiero insertar allí la lista de vacantes del sistema para que los visitantes puedan encontrarlas sin duplicar su mantenimiento.

**Criterios de aceptación propuestos:**

- Se ofrece un mecanismo para insertar la lista pública de vacantes en el sitio institucional.
- La información proviene de la misma fuente que la página de empleos del sistema y respeta los estados de publicación.
- Al pausar, cerrar o cancelar una vacante, el sitio institucional deja de ofrecer su postulación.

**Entrega propuesta:** Ampliación. El enlace directo de HU-02-09 cubre la difusión inicial.

### Reglas confirmadas por el cliente

| Tema | Decisión registrada |
| --- | --- |
| Requisición y aprobación | Solicita un gerente o socio. La publicación requiere visto bueno del gerente solicitante y RR. HH.; una plaza nueva requiere además un socio. Solo RR. HH. publica. |
| Campos de la vacante | Son obligatorios puesto, área, responsable, tipo de empleo, nivel, número de plazas, experiencia, descripción, responsabilidades, formación y certificaciones requeridas, ubicación, modalidad y fecha límite. Idiomas, viajes y certificaciones deseables son opcionales. |
| Ubicación y compensación | La ubicación usa departamento y municipio de Guatemala. Código, centro de costo, rango salarial y datos del reemplazo son internos. El rango de la firma no se publica; sí se pide expectativa salarial al candidato. |
| Estados | Borrador, pendiente de aprobación, aprobada, abierta, en pausa, cerrada, cubierta y cancelada. Solo abierta recibe postulaciones; en pausa permanece visible. Cerrada y en pausa pueden reabrirse con registro. |
| Cierre | Una oferta aceptada deja una plaza en incorporación. La plaza queda cubierta al incorporarse la persona y la vacante queda cubierta cuando todas sus plazas lo están. Al vencer el plazo se avisa a RR. HH., que decide si cierra. |
| Formulario | Campos básicos obligatorios para todos, campos por tipo de puesto y preguntas filtro; no se piden documentos de identidad ni datos sensibles en la postulación inicial. |
| Página pública | Incluida en el sistema, con marca de la firma, en español, adaptable a celular e indexable para vacantes abiertas. El enlace directo es prioritario; la inserción en el sitio institucional puede esperar. |
| Difusión externa | Primera etapa manual mediante enlace y texto copiable, con registro de canal y fecha. No se actualizan portales externos automáticamente. |
| Consentimiento y archivos | Consentimiento para selección obligatorio y autorización futura opcional y separada. Solo PDF, DOC y DOCX; hasta 5 MB por archivo, tres archivos por postulación; revisión antivirus. |
| Acceso y trazabilidad | Solo RR. HH. y el responsable de esa vacante ven candidatos. Se registran consultas y exportaciones, además de los cambios de una vacante. |

### Precisiones aún necesarias

1. **Revisión legal:** el asesor del cliente debe validar el aviso de privacidad, la base para tratar datos, el punto de inicio del plazo de 24 meses, la eliminación o anonimización y la conservación del registro de auditoría.
2. **Aprobaciones:** falta aclarar si el gerente solicitante puede aprobar su propia requisición y cómo se repite la aprobación tras una corrección o una reapertura.
3. **Plantillas:** RR. HH. debe entregar la plantilla de requisición y confirmar el listado exacto de campos condicionales por tipo de puesto.
4. **Cambios relevantes:** debe acordarse el umbral para distinguir una corrección menor de un cambio que exige confirmación del responsable de contratación.
5. **Reapertura de una vacante cubierta:** falta definir si requiere una nueva requisición o si puede reabrirse la vacante existente.
6. **Archivos y solicitudes de eliminación:** falta precisar el procedimiento cuando un archivo no supera la revisión antivirus y cómo se verifica la identidad del solicitante de eliminación.

### Criterio de éxito de la épica

Un gerente o socio puede justificar una plaza; RR. HH. prepara una vacante completa, obtiene las aprobaciones, la publica en la página propia y recibe postulaciones válidas. La firma conoce dónde difundió la vacante, limita el acceso a los datos de candidatos y mantiene trazabilidad al modificar o cerrar la publicación.
