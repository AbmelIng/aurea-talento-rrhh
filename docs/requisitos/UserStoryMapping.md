# User Story Mapping — Sistema de Recursos Humanos

## Propósito

Este archivo reúne el mapa de historias de usuario del proyecto. Cada épica se desarrollará a partir de las [épicas consolidadas](epicas_sistema_rrhh.md). EP-01 incorpora las decisiones comunicadas por el cliente, una firma de auditoría financiera con sede en Guatemala. Las reglas laborales indicadas por el cliente se registran como requisitos de negocio y quedan sujetas a la revisión de su asesor laboral antes de su implementación definitiva.

**Convención:** `HU-01-01` identifica la historia 01 de la épica 01. Las prioridades de entrega son propuestas para conversar con el cliente, no compromisos de calendario.

## Avance por épica

| Épica | Nombre | Estado del mapping |
| --- | --- | --- |
| EP-01 | Portal del empleado y gestión de ausencias | Historias actualizadas con decisiones del cliente |
| EP-02 | Creación y publicación de vacantes | [Actualizada con decisiones del cliente](UserStoryMappingEp2.md) |
| EP-03 | Selección y contratación de candidatos | [Actualizada con decisiones del cliente](UserStoryMappingEp3.md) |
| EP-04 | Administración de empleados y estructura organizacional | [Historias propuestas para validación](UserStoryMappingEp4.md) |
| EP-05 | Incorporación de nuevos empleados | [Historias propuestas para validación](UserStoryMappingEp5.md) |
| EP-06 | Historial laboral y beneficios | [Historias propuestas para validación](UserStoryMappingEp6.md) |
| EP-07 | Documentos y capacitación | Pendiente |
| EP-08 | Objetivos y evaluaciones de desempeño | Pendiente |
| EP-09 | Reportes y análisis de satisfacción | Pendiente |
| EP-10 | Control de horas e información de nómina | [Historias propuestas para validación](UserStoryMappingEp10.md) |

---

## EP-01. Portal del empleado y gestión de ausencias

### Resultado que busca el usuario

Al entrar al sistema, un empleado puede identificar lo que requiere su atención, conocer su tiempo libre disponible, solicitar una ausencia y consultar su resolución y las ausencias programadas. La persona aprobadora puede decidir oportunamente y RR. HH. puede administrar las reglas que hacen confiable el cálculo.

### Personas involucradas

- **Empleado:** consulta saldos, registra y da seguimiento a solicitudes, y ve ausencias de su equipo o proyecto.
- **Supervisor o gerente:** aprueba solicitudes según tipo y duración; consulta las ausencias y solicitudes pendientes de su línea de reporte.
- **Socio:** participa en la aprobación de ausencias sin goce de sueldo.
- **RR. HH.:** administra políticas, horarios, feriados, bloqueos y saldos; aprueba los casos que le corresponden, registra ausencias en nombre de empleados y ajusta con justificación.
- **Comunicación Interna, Gerencia General y TI:** publican o apoyan la administración de contenidos y enlaces según lo acordado.

### Mapa de actividades e historias

Las columnas siguen el recorrido desde la configuración hasta la consulta posterior. Las filas proponen cortes de entrega acumulativos; la primera debe cubrir un circuito de solicitud y decisión utilizable.

| Entrega | Preparar reglas | Consultar y solicitar | Decidir y ajustar | Seguir y planificar | Comunicarse |
| --- | --- | --- | --- | --- | --- |
| **Primera entrega** | [HU-01-13](#hu-01-13-configurar-politicas-feriados-y-bloqueos), [HU-01-16](#hu-01-16-registrar-una-ausencia-en-nombre-de-un-empleado) | [HU-01-01](#hu-01-01-consultar-el-inicio-personal), [HU-01-02](#hu-01-02-consultar-saldos-de-tiempo-libre), [HU-01-04](#hu-01-04-registrar-una-solicitud-de-ausencia), [HU-01-15](#hu-01-15-usar-las-funciones-esenciales-desde-el-celular) | [HU-01-11](#hu-01-11-aprobar-o-rechazar-solicitudes), [HU-01-12](#hu-01-12-cancelar-anular-o-ajustar-solicitudes) | [HU-01-05](#hu-01-05-consultar-ausencias-programadas), [HU-01-07](#hu-01-07-consultar-el-estado-de-mis-solicitudes) | Avisos operativos de [HU-01-06](#hu-01-06-consultar-avisos-y-pendientes) |
| **Ampliación** | — | [HU-01-03](#hu-01-03-consultar-el-detalle-de-un-saldo) | — | [HU-01-08](#hu-01-08-ver-quien-esta-ausente) | [HU-01-14](#hu-01-14-administrar-avisos-y-enlaces-corporativos), resto de [HU-01-06](#hu-01-06-consultar-avisos-y-pendientes) |
| **Complemento** | — | — | — | [HU-01-10](#hu-01-10-acceder-a-resumenes-de-otras-areas) | [HU-01-09](#hu-01-09-consultar-informacion-de-la-empresa) |

Las reglas, rutas de aprobación y protección de datos aplican a todas las entregas donde se use la función correspondiente. La mejora para mostrar conflictos de proyectos o clientes en el calendario de equipo queda fuera de la primera entrega.

### Historias de usuario

#### HU-01-01. Consultar el inicio personal

**Historia:** Como empleado, quiero ver un inicio adaptado a mí para identificar rápidamente información y acciones relevantes.

**Criterios de aceptación propuestos:**

- Se muestra la identidad del empleado que inició sesión y solo la información a la que tiene acceso.
- El inicio ofrece acceso directo a la solicitud de tiempo libre, a los saldos y a las solicitudes pendientes de atención del usuario.
- Cuando no haya información para una sección, se muestra un estado vacío comprensible.
- El contenido se presenta en español y las fechas se muestran en formato día/mes/año.

**Entrega propuesta:** Primera entrega.

#### HU-01-02. Consultar saldos de tiempo libre

**Historia:** Como empleado, quiero ver cuánto tiempo tengo disponible por tipo de ausencia para planificar una solicitud.

**Criterios de aceptación propuestos:**

- Se muestran los tipos aplicables al empleado: vacaciones, enfermedad o cita médica, permiso personal, licencias legales, compensatorio y ausencia sin goce de sueldo. Maternidad se registra por RR. HH., no por autoservicio.
- Para cada tipo se indica su unidad: vacaciones en días hábiles; permisos médico, personal y compensatorio en horas; licencias legales y ausencia sin goce en días; maternidad en días calendario.
- En los tipos con cupo se distinguen **disponible**, **en trámite** y **programado**. Los tipos sin tope o sin saldo muestran un indicador de uso o registro, sin inventar un saldo disponible.
- El saldo mostrado corresponde a una fecha de referencia identificable.
- Las solicitudes pendientes reservan tiempo **en trámite** para evitar solicitar dos veces el mismo cupo. Al rechazarse o cancelarse, se libera; al aprobarse, pasa a programado.

**Entrega propuesta:** Primera entrega.

#### HU-01-03. Consultar el detalle de un saldo

**Historia:** Como empleado, quiero consultar el detalle de un tipo de ausencia para entender su saldo y el tiempo programado.

**Criterios de aceptación propuestos:**

- Desde el resumen se puede abrir el detalle del tipo de ausencia seleccionado.
- El detalle identifica las tres cifras aplicables, las ausencias próximas y los vencimientos del tipo seleccionado.
- Los datos del resumen y del detalle usan la misma unidad y fecha de referencia.
- Para vacaciones, el detalle permite distinguir períodos generados y excepciones autorizadas por RR. HH.; para compensatorios, la fecha de acreditación y vencimiento.

**Entrega propuesta:** Ampliación.

#### HU-01-04. Registrar una solicitud de ausencia

**Historia:** Como empleado, quiero indicar fechas y tipo de ausencia, ver la cantidad calculada y añadir una nota opcional para solicitar tiempo libre con información correcta.

**Criterios de aceptación propuestos:**

- El formulario solicita fecha inicial, fecha final y tipo de ausencia; calcula y muestra la cantidad antes del envío y permite añadir una nota.
- Para vacaciones se cuentan días hábiles y se excluyen sábados, domingos y feriados aplicables. El cálculo usa el horario individual; los feriados corresponden a la sede base del empleado.
- Se admite media jornada solo en vacaciones y permiso personal. En permisos por horas, la edición manual admite incrementos mínimos de media hora.
- No se envía una solicitud si falta un dato obligatorio, la cantidad no es válida, la fecha final es anterior a la inicial o existe solapamiento que duplicaría tiempo ya solicitado.
- El tiempo en trámite ya está reservado: una nueva solicitud no puede superar el saldo **disponible**, salvo adelanto de hasta cinco días de vacaciones autorizado por RR. HH.; el adelanto queda como saldo negativo y se descuenta del siguiente período. Los tipos sin cupo fijo no se bloquean por saldo.
- Durante un período de bloqueo, las vacaciones requieren autorización especial antes de continuar.
- Un permiso médico o por enfermedad que supera dos días requiere adjuntar constancia; solo el aprobador directo y RR. HH. pueden verla.
- El empleado puede consultar las cifras disponible, en trámite y programado mientras prepara la solicitud.
- Al enviarla, recibe una confirmación con los datos registrados y un identificador o referencia de la solicitud.
- La solicitud se conserva una sola vez aunque el usuario intente enviarla repetidamente por error.

**Entrega propuesta:** Primera entrega.

**Regla de origen:** RR. HH. registra las ausencias por maternidad y los créditos compensatorios; el empleado no los crea mediante este formulario.

#### HU-01-05. Consultar ausencias programadas

**Historia:** Como empleado, quiero ver mis próximas ausencias para comprobar las fechas y cantidades registradas.

**Criterios de aceptación propuestos:**

- Se muestran únicamente las solicitudes **aprobadas** como ausencias programadas, con rango de fechas, tipo y cantidad.
- Las entradas aparecen ordenadas por fecha.
- Si no hay ausencias próximas, se indica de forma clara.
- Solo se muestran ausencias del empleado que inició sesión, salvo permisos expresos para otros roles.
- Una solicitud pendiente se muestra en trámite, sin mezclarse con las ausencias programadas; si se rechaza o cancela, deja de reservar tiempo.

**Entrega propuesta:** Primera entrega.

#### HU-01-06. Consultar avisos y pendientes

**Historia:** Como empleado, quiero ver avisos y actividades que requieren mi atención para saber qué hacer después.

**Criterios de aceptación propuestos:**

- Cada elemento identifica su asunto, prioridad y, si corresponde, fecha límite o vigencia.
- Los avisos automáticos incluyen aprobaciones pendientes, saldos próximos a vencer y otras tareas habilitadas por las épicas correspondientes.
- Los que requieren acción aparecen primero, ordenados por fecha límite próxima; después aparecen los informativos y generales del más reciente al más antiguo.
- Los elementos que requieren acción ofrecen acceso a su contexto o función de origen.
- Un aviso vencido deja de mostrarse y ninguno revela información fuera de los permisos del usuario.

**Entrega propuesta:** Avisos operativos de ausencia en la primera entrega; avisos de otras áreas en la ampliación.

**Dependencia:** Los avisos de objetivos, evaluaciones y otras áreas requieren datos de sus respectivas épicas.

#### HU-01-07. Consultar el estado de mis solicitudes

**Historia:** Como empleado, quiero conocer el estado de mis solicitudes de tiempo libre para saber si requieren alguna acción adicional.

**Criterios de aceptación propuestos:**

- Cada solicitud muestra las fechas, el tipo, la cantidad y su estado actual.
- Se admiten los estados **borrador** (si se habilita el guardado), **pendiente de aprobación**, **aprobada**, **rechazada**, **cancelada** y **disfrutada/cerrada**.
- Una solicitud pendiente identifica el nivel de aprobación en que se encuentra. Una rechazada muestra el motivo proporcionado por quien decidió.
- Cada cambio conserva fecha, usuario y estado anterior y nuevo; el empleado puede consultar ese historial según sus permisos.
- Tras la aprobación final, la solicitud figura como ausencia programada. Después de la fecha de disfrute pasa a cerrada según la regla definida por RR. HH.

**Entrega propuesta:** Primera entrega.

#### HU-01-08. Ver quién está ausente

**Historia:** Como empleado o responsable de equipo, quiero ver qué compañeros estarán ausentes para organizar actividades compartidas.

**Criterios de aceptación propuestos:**

- Se muestran personas ausentes agrupadas por fecha o periodo cercano.
- El empleado ve solo su equipo o proyecto; supervisores y gerentes, su línea de reporte; socios y RR. HH., toda la firma.
- Los responsables ven las solicitudes pendientes de su equipo con un indicador distinto de las aprobadas.
- Para usuarios no autorizados se muestra solo «Ausente», «Permiso» o «Vacaciones». Los permisos médicos y licencias sensibles nunca muestran el motivo ni adjuntos en el calendario.
- El supervisor aprobador puede consultar el tipo necesario para decidir, pero no diagnósticos ni detalles médicos; las constancias quedan restringidas al aprobador directo y RR. HH.

**Entrega propuesta:** Ampliación.

#### HU-01-09. Consultar información de la empresa

**Historia:** Como empleado, quiero encontrar celebraciones y enlaces útiles de la empresa desde el inicio para acceder fácilmente a información común.

**Criterios de aceptación propuestos:**

- Se muestran cumpleaños y aniversarios generados automáticamente solo del equipo o sede. El empleado puede optar por no mostrar su cumpleaños.
- Otros eventos personales se publican únicamente con consentimiento del empleado.
- Se muestran enlaces configurados para el rol del empleado, agrupados por categoría y con un máximo aproximado de ocho a diez visibles.
- Cada enlace lleva al recurso indicado y presenta una etiqueta clara.
- Si una sección no tiene contenido, no impide utilizar las funciones principales del inicio.

**Entrega propuesta:** Complemento.

#### HU-01-10. Acceder a resúmenes de otras áreas

**Historia:** Como empleado, quiero ver resúmenes de mis objetivos y beneficios para llegar rápidamente a su información detallada.

**Criterios de aceptación propuestos:**

- El inicio muestra solo los resúmenes de áreas habilitadas para el empleado.
- Cada resumen permite ir al módulo donde se mantiene el dato completo.
- El resumen y el módulo de origen muestran información coherente.

**Entrega propuesta:** Complemento.

**Dependencias:** Los objetivos corresponden a EP-08 y los beneficios a EP-06. Esta historia solo cubre su presentación en el inicio.

#### HU-01-11. Aprobar o rechazar solicitudes

**Historia:** Como aprobador designado, quiero decidir una solicitud desde mi lista de pendientes para que el empleado conozca el resultado y el equipo pueda planificar.

**Criterios de aceptación propuestos:**

- La ruta depende del tipo y duración: vacaciones de hasta cinco días hábiles, supervisor o gerente directo; más de cinco, gerente directo y después RR. HH.; permiso personal o médico, supervisor directo; licencia legal o maternidad, RR. HH. con aviso al supervisor; sin goce de sueldo, gerente, socio y RR. HH.
- Solo el nivel que está en turno puede decidir; cuando exista más de un nivel, la solicitud permanece pendiente hasta la última aprobación.
- Rechazar exige un motivo y libera el tiempo en trámite. La aprobación final lo convierte en tiempo programado.
- Cada gerente puede designar a su suplente. Si el aprobador está ausente, la solicitud pasa al suplente designado. Si transcurren tres días hábiles sin respuesta, se escala al siguiente nivel y queda constancia del evento.
- El aprobador puede decidir desde la versión móvil con verificación en dos pasos.
- Toda decisión conserva usuario, fecha, resultado y motivo cuando corresponda.

**Entrega propuesta:** Primera entrega.

**Precisión pendiente:** El cliente no especificó la ruta de aprobación del uso de compensatorios ni el destino de un escalamiento cuando ya no existe un nivel superior.

#### HU-01-12. Cancelar, anular o ajustar solicitudes

**Historia:** Como empleado o integrante autorizado de RR. HH., quiero cancelar o corregir una solicitud conforme a las reglas de la firma para mantener saldos y calendario correctos.

**Criterios de aceptación propuestos:**

- El empleado puede cancelar una solicitud pendiente en cualquier momento y una aprobada hasta dos días hábiles antes del inicio.
- Después de ese plazo, solo RR. HH. puede anularla y debe registrar una justificación escrita.
- Una solicitud enviada no se edita: para cambiarla se cancela y se crea otra. Si estaba aprobada, se revierte el tiempo programado antes de tramitar la nueva.
- Una solicitud rechazada no descuenta saldo; el empleado puede crear otra.
- RR. HH. puede hacer ajustes de saldo con justificación escrita. Cada operación conserva fecha, usuario, valor anterior y nuevo.

**Entrega propuesta:** Primera entrega.

#### HU-01-13. Configurar políticas, feriados y bloqueos

**Historia:** Como responsable de RR. HH., quiero mantener las reglas de ausencias, los horarios y el calendario aplicable para que saldos y cantidades se calculen correctamente.

**Criterios de aceptación propuestos:**

- RR. HH. puede mantener feriados nacionales y locales; el cálculo usa los de la sede base del empleado.
- RR. HH. puede configurar el horario individual, incluidos horarios rotativos, y definir períodos de bloqueo de vacaciones.
- La política de vacaciones genera 15 días hábiles por año laboral cumplido desde el ingreso, admite como máximo dos períodos acumulados (30 días) y vence los saldos no usados a los dos años, salvo excepción autorizada por RR. HH.
- El sistema avisa 60 días antes del vencimiento de vacaciones; los créditos compensatorios vencen a los seis meses de su generación.
- El permiso personal dispone de 24 horas por año, sin acumulación. El permiso médico o por enfermedad no tiene tope fijo; si supera dos días exige constancia médica. Sus contadores anuales se reinician sin trasladar cupos al año siguiente.
- RR. HH. puede acreditar horas compensatorias y autorizar hasta cinco días de adelanto de vacaciones; el adelanto se refleja como saldo negativo que se descuenta del siguiente período.
- Toda modificación de política, saldo, feriado, horario o bloqueo conserva autor, fecha y valor anterior y nuevo.

**Entrega propuesta:** Primera entrega, con las reglas necesarias para habilitar el circuito de ausencias.

**Nota:** Los valores de licencias legales y maternidad se configurarán tras revisión del asesor laboral del cliente. Las licencias legales no descuentan vacaciones; la ausencia sin goce de sueldo no depende de un saldo.

#### HU-01-14. Administrar avisos y enlaces corporativos

**Historia:** Como responsable autorizado, quiero publicar avisos y mantener enlaces relevantes para que cada empleado encuentre información vigente para su función.

**Criterios de aceptación propuestos:**

- RR. HH., Gerencia General o Comunicación Interna pueden publicar avisos según sus permisos, dirigidos a toda la firma, un área, una sede o un rol.
- Cada aviso tiene prioridad urgente, informativa o general y fecha de vigencia.
- RR. HH., con apoyo de TI, mantiene enlaces agrupados por categoría y visibles según el rol; define su orden y limita el inicio a unos ocho a diez enlaces.
- Comunicación Interna solo publica eventos personales distintos de cumpleaños o aniversarios cuando exista consentimiento del empleado.

**Entrega propuesta:** Ampliación. Los avisos automáticos indispensables para aprobar solicitudes y advertir vencimientos se incluyen en la primera entrega.

#### HU-01-15. Usar las funciones esenciales desde el celular

**Historia:** Como empleado o aprobador que trabaja fuera de la oficina, quiero usar las funciones esenciales desde el navegador de mi celular para consultar y resolver asuntos sin esperar a volver al escritorio.

**Criterios de aceptación propuestos:**

- La versión web adaptable permite ver inicio, saldos y ausencias próximas; solicitar ausencias; consultar su estado; revisar avisos; y aprobar o rechazar cuando el usuario tiene ese permiso.
- Funciona con el mismo usuario corporativo y exige verificación en dos pasos a quienes aprueban solicitudes o consultan datos sensibles.
- Las acciones principales siguen siendo utilizables con una conexión móvil lenta y no requieren instalar una aplicación nativa.
- Los textos están en español y las fechas usan el formato día/mes/año.

**Entrega propuesta:** Primera entrega. Reportes, configuración de políticas y calendario, y vistas complejas de equipo pueden permanecer solo en escritorio.

#### HU-01-16. Registrar una ausencia en nombre de un empleado

**Historia:** Como integrante autorizado de RR. HH., quiero registrar una ausencia por cuenta de un empleado para cubrir casos que no se tramitan mediante autoservicio.

**Criterios de aceptación propuestos:**

- RR. HH. puede seleccionar al empleado, el tipo, el periodo y la cantidad, con las mismas validaciones de calendario y horario aplicables.
- El registro identifica que fue creado por RR. HH. y conserva una justificación cuando corresponde.
- La maternidad y los créditos compensatorios se registran por RR. HH.; el empleado no puede crearlos desde su formulario.
- El registro actualiza las cifras y vistas correspondientes según su estado, sin duplicar tiempo.

**Entrega propuesta:** Primera entrega, junto con HU-01-13, para registrar maternidad, créditos compensatorios y otras ausencias que no se crean por autoservicio.

### Reglas confirmadas por el cliente

| Tema | Decisión registrada |
| --- | --- |
| Vacaciones | 15 días hábiles por año laboral cumplido; máximo dos períodos acumulados (30 días); vencen a los dos años salvo excepción de RR. HH.; aviso 60 días antes; adelanto autorizado de hasta cinco días; bloqueos configurables para temporada alta. |
| Enfermedad o cita médica | Se mide en horas, sin tope fijo; requiere constancia si supera dos días. La empresa registra el evento y no calcula una prestación del IGSS en esta épica. |
| Permiso personal | 24 horas por año, sin acumulación; admite media jornada equivalente a cuatro horas. |
| Licencias legales y maternidad | Se miden en días según el tipo; las licencias legales no descuentan vacaciones. Maternidad usa días calendario y la registra RR. HH. |
| Compensatorio | RR. HH. acredita las horas; cada crédito vence a los seis meses. |
| Sin goce de sueldo | Se mide en días, no usa saldo y sigue la ruta gerente → socio → RR. HH. |
| Cálculo | Vacaciones excluyen sábados, domingos y feriados aplicables; se utiliza el horario individual y la sede base para el calendario local. La cantidad se calcula antes del envío. |
| Estados | Borrador opcional, pendiente, aprobada, rechazada, cancelada y disfrutada/cerrada. Las pendientes cuentan como «en trámite»; solo la aprobación final crea una ausencia programada. |
| Cancelación | Pendiente: el empleado puede cancelar. Aprobada: el empleado puede cancelar hasta dos días hábiles antes; luego solo RR. HH. puede anular con justificación. Una enviada se reemplaza mediante cancelación y nueva solicitud. |
| Privacidad | Empleados ven su equipo o proyecto; responsables ven su línea de reporte; socios y RR. HH. ven toda la firma. Motivos y adjuntos sensibles se restringen según el rol. |
| Inicio y móvil | Avisos por prioridad y vigencia, celebraciones acotadas al equipo o sede, enlaces por rol y versión web adaptable en español con fecha día/mes/año. |

### Precisiones aún necesarias

1. **Revisión laboral:** el cliente pidió verificar con su asesor los días concretos de licencias legales y las reglas de caducidad antes de tratarlos como cumplimiento normativo definitivo.
2. **Compensatorios:** falta definir quién aprueba su uso y cómo se combina ese proceso con su acreditación por RR. HH.
3. **Excepciones de vacaciones:** falta identificar quién otorga la autorización especial durante períodos bloqueados y en qué punto de la ruta se autoriza el adelanto de saldo.
4. **Escalamiento final:** falta definir a quién se dirige una solicitud sin respuesta cuando el aprobador actual ya es el último nivel.
5. **Enfermedad:** al no existir un tope fijo, falta precisar qué contador anual se reinicia y cómo debe verse en la tarjeta de saldos.
6. **Horarios rotativos:** falta confirmar cómo se aplica el conteo de vacaciones en días hábiles de lunes a viernes cuando el horario asignado incluye fines de semana.

### Criterio de éxito de la épica

Un empleado puede entrar, comprender su saldo de tiempo libre, registrar una solicitud válida y comprobar sus ausencias próximas sin solicitar a RR. HH. información que ya consta en el sistema.
