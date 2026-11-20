# User Story Mapping — EP-04: Administración de empleados y estructura organizacional

## Propósito

Este archivo desarrolla la cuarta épica de las [épicas consolidadas](epicas_sistema_rrhh.md) con la misma estructura de [UserStoryMapping.md](UserStoryMapping.md), [UserStoryMappingEp2.md](UserStoryMappingEp2.md) y [UserStoryMappingEp3.md](UserStoryMappingEp3.md). El mapa cubre la creación y mantenimiento del expediente básico, el directorio, el organigrama y el control de acceso a la información.

La propuesta está adaptada a una firma de auditoría financiera con sede en Guatemala. Distingue la estructura laboral formal de posibles asignaciones temporales a auditorías, clientes o proyectos. Estas asignaciones, los campos definitivos y los permisos por dato deben validarse con el cliente antes de considerarse reglas confirmadas.

**Convención:** `HU-04-01` identifica la historia 01 de la épica 04. Las entregas son propuestas de prioridad, no fechas comprometidas.

## Avance por épica

| Épica | Nombre | Estado del mapping |
| --- | --- | --- |
| EP-01 | Portal del empleado y gestión de ausencias | [Desarrollada](UserStoryMapping.md#ep-01-portal-del-empleado-y-gestion-de-ausencias) |
| EP-02 | Creación y publicación de vacantes | [Actualizada con decisiones del cliente](UserStoryMappingEp2.md) |
| EP-03 | Selección y contratación de candidatos | [Actualizada con decisiones del cliente](UserStoryMappingEp3.md) |
| EP-04 | Administración de empleados y estructura organizacional | Historias propuestas para validación con el cliente |
| EP-05 | Incorporación de nuevos empleados | [Historias propuestas para validación](UserStoryMappingEp5.md) |
| EP-06 | Historial laboral y beneficios | [Historias propuestas para validación](UserStoryMappingEp6.md) |
| EP-07 | Documentos y capacitación | Pendiente |
| EP-08 | Objetivos y evaluaciones de desempeño | Pendiente |
| EP-09 | Reportes y análisis de satisfacción | Pendiente |
| EP-10 | Control de horas e información de nómina | [Historias propuestas para validación](UserStoryMappingEp10.md) |

---

## EP-04. Administración de empleados y estructura organizacional

### Resultado que busca el usuario

La firma dispone de un expediente básico único por empleado, un directorio confiable y una representación clara de la estructura formal. Cada persona consulta o modifica únicamente los datos permitidos, y las acciones sensibles dejan trazabilidad suficiente para una organización dedicada a auditoría financiera.

### Personas involucradas

- **Empleado:** consulta su perfil y los datos públicos o internos permitidos de otros empleados; puede solicitar o realizar cambios autorizados en su propia información.
- **Supervisor, gerente o socio:** consulta su equipo formal y los datos necesarios para administrarlo, dentro de los permisos definidos.
- **RR. HH.:** crea y mantiene expedientes, estructura organizacional, estados laborales y campos de personal.
- **Administrador de seguridad o TI:** crea cuentas y administra aspectos técnicos de acceso sin recibir automáticamente permiso para ver todos los datos personales.
- **Responsable de Cumplimiento o Independencia:** posible usuario de campos o accesos específicos relacionados con la función de la firma; su alcance debe confirmarse.
- **Auditor interno autorizado:** consulta la trazabilidad cuando corresponda, sin modificar los datos auditados.

### Mapa de actividades e historias

Las columnas siguen el recorrido desde el alta de un expediente hasta su consulta y protección. La primera entrega propone una fuente básica de empleados, una estructura formal y controles de acceso verificables.

| Entrega | 1. Registrar | 2. Mantener el expediente | 3. Consultar personas | 4. Representar la estructura | 5. Proteger y controlar |
| --- | --- | --- | --- | --- | --- |
| **Primera entrega** | [HU-04-03](#hu-04-03-crear-y-activar-un-expediente), [HU-04-16](#hu-04-16-desactivar-o-reactivar-un-expediente) | [HU-04-04](#hu-04-04-mantener-datos-personales-y-de-contacto), [HU-04-05](#hu-04-05-mantener-datos-laborales-vigentes) | [HU-04-01](#hu-04-01-consultar-y-localizar-empleados), [HU-04-02](#hu-04-02-consultar-el-perfil-de-un-empleado), [HU-04-08](#hu-04-08-consultar-el-directorio) | [HU-04-09](#hu-04-09-consultar-el-organigrama), [HU-04-10](#hu-04-10-administrar-unidades-puestos-y-líneas-de-reporte) | [HU-04-12](#hu-04-12-asignar-niveles-de-acceso), [HU-04-13](#hu-04-13-controlar-el-acceso-por-campo-y-relación), [HU-04-17](#hu-04-17-auditar-consultas-y-cambios) |
| **Ampliación** | — | [HU-04-06](#hu-04-06-configurar-campos-del-expediente), [HU-04-07](#hu-04-07-solicitar-cambios-en-datos-propios) | Acceso móvil ampliado de [HU-04-08](#hu-04-08-consultar-el-directorio), [HU-04-15](#hu-04-15-exportar-el-directorio-o-la-estructura) | [HU-04-11](#hu-04-11-registrar-asignaciones-a-proyectos-o-clientes) | [HU-04-14](#hu-04-14-otorgar-acceso-temporal-o-delegado) |

### Historias de usuario

#### HU-04-01. Consultar y localizar empleados

**Historia:** Como usuario autorizado, quiero buscar empleados y filtrar el listado para encontrar rápidamente a la persona que necesito.

**Criterios de aceptación propuestos:**

- El listado permite buscar por nombre y filtrar por estado laboral, área, puesto, ubicación y responsable, si el usuario tiene acceso a esos campos.
- Cada resultado muestra únicamente los datos permitidos para el rol que consulta.
- Los empleados inactivos se distinguen de los activos y no aparecen por defecto en el directorio general.
- Desde un resultado se puede abrir el perfil cuando el usuario tenga permiso.
- La búsqueda no revela que existe un expediente cuando el usuario carece de acceso a esa persona o categoría.

**Entrega propuesta:** Primera entrega.

#### HU-04-02. Consultar el perfil de un empleado

**Historia:** Como empleado o responsable autorizado, quiero abrir un perfil para consultar la información laboral y de contacto que necesito.

**Criterios de aceptación propuestos:**

- El perfil muestra una cabecera con nombre, puesto y datos organizativos permitidos.
- Las secciones y campos visibles se adaptan al rol, a la relación con el empleado y al nivel de sensibilidad.
- El empleado puede consultar sus propios datos con mayor detalle que los disponibles en el directorio.
- Los datos restringidos, como identificación, compensación, información bancaria, médica o de emergencia, no aparecen por el simple hecho de poder abrir el perfil.
- Desde el perfil se enlazan las áreas correspondientes del sistema sin duplicar historiales que pertenecen a otras épicas.

**Entrega propuesta:** Primera entrega.

#### HU-04-03. Crear y activar un expediente

**Historia:** Como integrante autorizado de RR. HH., quiero crear un expediente único para habilitar al empleado en los procesos que le corresponden.

**Criterios de aceptación propuestos:**

- El expediente puede originarse en el traspaso de una contratación desde EP-03 y EP-05, o mediante un alta manual autorizada para migraciones y excepciones.
- Antes de crear, el sistema busca posibles duplicados mediante los identificadores definidos por la firma.
- El alta registra un identificador interno único, datos personales mínimos, puesto, área, responsable, ubicación, fecha de contratación y estado laboral.
- Los datos transferidos desde selección conservan su origen y no incluyen notas ni calificaciones de entrevistas.
- La activación registra quién la realizó y cuándo; la creación del expediente no concede por sí sola acceso a todos los módulos.
- Si faltan datos requeridos, el expediente puede quedar en preparación sin aparecer como empleado activo.

**Entrega propuesta:** Primera entrega.

#### HU-04-04. Mantener datos personales y de contacto

**Historia:** Como integrante autorizado de RR. HH., quiero actualizar los datos personales y de contacto para conservar un expediente confiable.

**Criterios de aceptación propuestos:**

- Se pueden mantener los campos personales, de contacto y emergencia que el cliente confirme como necesarios.
- Cada campo aplica formato y obligatoriedad acordes con Guatemala y evita catálogos de otros países cuando no corresponden.
- Los cambios sensibles registran valor anterior, valor nuevo, responsable, fecha y motivo cuando se exija.
- El sistema diferencia datos legales, datos de uso cotidiano y datos visibles en el directorio.
- Una modificación no sobrescribe el historial laboral que corresponde a EP-06.

**Entrega propuesta:** Primera entrega.

#### HU-04-05. Mantener datos laborales vigentes

**Historia:** Como integrante autorizado de RR. HH., quiero mantener las condiciones laborales vigentes para que el perfil y la estructura reflejen la situación actual.

**Criterios de aceptación propuestos:**

- Se mantienen identificador, puesto, nivel, área, ubicación, responsable formal, tipo de empleo, fecha de contratación y estado laboral.
- Los cambios con fecha de vigencia actualizan la situación visible y generan el registro histórico correspondiente en EP-06.
- Cambiar el responsable o el área actualiza el organigrama sin borrar la relación anterior.
- Los datos de compensación y nómina permanecen restringidos aunque formen parte del expediente laboral.
- El sistema advierte si el cambio dejaría una relación jerárquica circular o una unidad sin responsable cuando la política lo prohíba.

**Entrega propuesta:** Primera entrega.

#### HU-04-06. Configurar campos del expediente

**Historia:** Como administrador funcional de RR. HH., quiero configurar campos adicionales para adaptar el expediente a necesidades aprobadas de la firma.

**Criterios de aceptación propuestos:**

- Un campo configurable define nombre, descripción, tipo de dato, obligatoriedad, sección, vigencia y nivel de sensibilidad.
- Antes de publicarlo se definen quién puede verlo y quién puede editarlo.
- Modificar o retirar un campo no elimina silenciosamente los datos existentes.
- Los campos de texto libre incluyen instrucciones para evitar registrar información sensible sin una finalidad definida.
- La creación y modificación de campos queda registrada.

**Entrega propuesta:** Ampliación.

#### HU-04-07. Solicitar cambios en datos propios

**Historia:** Como empleado, quiero actualizar o solicitar la corrección de mis datos para no depender de intercambios informales con RR. HH.

**Criterios de aceptación propuestos:**

- La firma define qué campos puede editar directamente el empleado y cuáles requieren solicitud y aprobación.
- Una solicitud muestra el valor propuesto, permite adjuntar el respaldo permitido y conserva su estado.
- RR. HH. puede aprobar, rechazar o pedir corrección con una explicación registrada.
- Un cambio aprobado actualiza el expediente y deja trazabilidad; uno rechazado no altera el dato vigente.
- El empleado no puede solicitar mediante este flujo cambios de puesto, salario, nivel o responsable formal.

**Entrega propuesta:** Ampliación.

#### HU-04-08. Consultar el directorio

**Historia:** Como empleado, quiero consultar un directorio interno para encontrar datos profesionales de mis compañeros.

**Criterios de aceptación propuestos:**

- El directorio muestra únicamente empleados activos y los campos que la firma declare visibles, como nombre, puesto, área, correo corporativo y extensión.
- Se puede buscar por nombre, puesto o área y abrir el perfil público interno permitido.
- Teléfonos personales, domicilio, identificación, salario, datos bancarios, médicos y de emergencia no se publican en el directorio.
- La visibilidad puede limitarse por grupo cuando exista una razón aprobada.
- La consulta básica funciona en celular; las funciones adicionales de navegación móvil pueden ampliarse después.

**Entrega propuesta:** Primera entrega; experiencia móvil ampliada después.

#### HU-04-09. Consultar el organigrama

**Historia:** Como empleado, quiero visualizar la estructura formal para entender las líneas de responsabilidad de la firma.

**Criterios de aceptación propuestos:**

- El organigrama parte de la relación formal de reporte y muestra nombre, puesto y unidad con el nivel de detalle permitido.
- Se puede buscar una persona y centrar la vista en su posición dentro de la estructura.
- Se pueden expandir o contraer niveles sin cargar información de perfiles a los que el usuario no tiene acceso.
- El número de reportes directos coincide con los expedientes activos relacionados.
- Las asignaciones temporales a auditorías o clientes no sustituyen automáticamente al responsable formal.

**Entrega propuesta:** Primera entrega.

#### HU-04-10. Administrar unidades, puestos y líneas de reporte

**Historia:** Como integrante autorizado de RR. HH., quiero mantener áreas, puestos y responsables para representar la estructura formal vigente.

**Criterios de aceptación propuestos:**

- Se pueden crear, modificar, inactivar y consultar unidades organizativas y puestos sin perder referencias históricas.
- Cada empleado activo puede tener un responsable formal según la regla que confirme la firma.
- El sistema evita ciclos jerárquicos y advierte inconsistencias antes de publicar cambios.
- Los cambios pueden tener fecha de vigencia y actualizan el perfil y organigrama cuando entra en vigor.
- Las unidades y niveles utilizados aquí son consistentes con vacantes, aprobaciones, ausencias y reportes.

**Entrega propuesta:** Primera entrega.

#### HU-04-11. Registrar asignaciones a proyectos o clientes

**Historia:** Como gerente autorizado, quiero registrar asignaciones temporales para distinguir el responsable formal de quienes coordinan el trabajo de una auditoría o cliente.

**Criterios de aceptación propuestos:**

- Una asignación identifica empleado, proyecto o compromiso, función, responsable, fechas y estado.
- La asignación no cambia el puesto, área ni responsable formal del expediente.
- Solo usuarios autorizados consultan nombres de clientes o proyectos restringidos.
- Al finalizar, el acceso asociado se retira según la política y la asignación queda en historial.
- Antes de implementar esta historia, el cliente debe confirmar si las asignaciones se administrarán en RR. HH. o en otro sistema especializado.

**Entrega propuesta:** Ampliación por validar.

#### HU-04-12. Asignar niveles de acceso

**Historia:** Como administrador autorizado, quiero asignar niveles de acceso para que cada persona use únicamente las funciones necesarias para su responsabilidad.

**Criterios de aceptación propuestos:**

- Existen niveles base para empleado, responsable y RR. HH., además de niveles personalizados aprobados.
- La asignación indica usuario, nivel, vigencia, responsable de autorización y motivo cuando corresponda.
- El acceso de un responsable depende de su relación vigente con los empleados y no habilita automáticamente a toda la organización.
- Ser administrador técnico no otorga automáticamente acceso a información salarial, médica, bancaria o de independencia.
- Un cambio de puesto, área o estado puede generar una revisión de accesos pendientes.

**Entrega propuesta:** Primera entrega.

#### HU-04-13. Controlar el acceso por campo y relación

**Historia:** Como responsable de seguridad, quiero definir permisos por categoría de dato y relación organizativa para proteger información sensible.

**Criterios de aceptación propuestos:**

- Los permisos distinguen al menos ver, crear, editar, exportar y administrar para cada categoría de información.
- La decisión puede considerar si el usuario consulta sus propios datos, un reporte directo, una persona asignada o cualquier empleado.
- Los campos personales, salariales, bancarios, médicos, de emergencia, de selección e independencia pueden tener controles distintos.
- La interfaz no muestra acciones ni valores para los que el usuario carece de permiso.
- Los permisos se prueban con una vista previa o usuario de prueba antes de activarse.

**Entrega propuesta:** Primera entrega.

#### HU-04-14. Otorgar acceso temporal o delegado

**Historia:** Como responsable autorizado, quiero conceder acceso temporal con vencimiento para cubrir una necesidad excepcional sin dejar permisos permanentes.

**Criterios de aceptación propuestos:**

- La concesión identifica alcance, motivo, aprobador, fecha inicial y vencimiento obligatorio.
- El sistema retira el acceso automáticamente al vencer y permite revocarlo antes.
- Los accesos temporales a datos sensibles requieren la aprobación que defina la firma.
- Toda consulta realizada durante la delegación se atribuye al usuario que actuó, no al aprobador.
- Una delegación nunca permite conceder permisos superiores a los que el aprobador está autorizado a delegar.

**Entrega propuesta:** Ampliación.

#### HU-04-15. Exportar el directorio o la estructura

**Historia:** Como usuario autorizado, quiero exportar información organizativa para utilizarla en una necesidad aprobada de negocio.

**Criterios de aceptación propuestos:**

- La exportación respeta los filtros actuales y únicamente incluye campos que el usuario puede exportar.
- Antes de generar el archivo se informa qué datos y cantidad de empleados se incluirán.
- Los datos sensibles quedan excluidos de una exportación estándar del directorio.
- Se registra quién exportó, cuándo, con qué filtros y qué categorías de datos.
- La firma define los formatos permitidos y si el archivo requiere protección adicional.

**Entrega propuesta:** Ampliación.

#### HU-04-16. Desactivar o reactivar un expediente

**Historia:** Como integrante autorizado de RR. HH., quiero desactivar o reactivar un expediente para reflejar la relación laboral sin perder trazabilidad.

**Criterios de aceptación propuestos:**

- Desactivar exige fecha efectiva, motivo y responsable, y retira al empleado del directorio activo según la fecha.
- La desactivación inicia la revisión o revocación de accesos sin borrar el expediente ni sus referencias históricas.
- Reactivar requiere verificar si corresponde al mismo expediente y evita crear un duplicado para una recontratación.
- El sistema registra quién realizó cada acción y conserva los estados anteriores.
- Las reglas de conservación posteriores a la salida se definirán con el cliente y su asesor.

**Entrega propuesta:** Primera entrega.

#### HU-04-17. Auditar consultas y cambios

**Historia:** Como auditor autorizado, quiero consultar la trazabilidad de accesos y cambios sensibles para investigar acciones y demostrar control.

**Criterios de aceptación propuestos:**

- La bitácora registra usuario, fecha y hora, empleado afectado, acción, categoría de dato y resultado.
- Para cambios se conservan valor anterior y nuevo cuando la política lo permita; secretos y documentos sensibles no se copian íntegramente a la bitácora.
- Las consultas, exportaciones, cambios de permisos y accesos temporales a categorías sensibles dejan registro.
- Solo roles expresamente autorizados consultan o exportan la bitácora, y esa consulta también queda registrada.
- Los registros no pueden modificarse desde las funciones normales del sistema y siguen el plazo de conservación que se confirme.

**Entrega propuesta:** Primera entrega.

### Reglas provenientes de épicas anteriores

| Tema | Decisión que debe respetar EP-04 |
| --- | --- |
| Traspaso desde selección | EP-03 transfiere datos personales y de contacto, puesto, nivel, área, jefe, fecha de ingreso, salario aprobado, oferta final, estados permitidos de verificaciones, salvaguardas y documentos. No transfiere notas ni calificaciones. |
| Incorporación condicionada | EP-05 puede iniciarse con una oferta aceptada sujeta a verificaciones permitidas, pero el ingreso no se confirma hasta resolverlas. |
| Independencia | Las salvaguardas de una persona contratada pasan al expediente correspondiente con acceso restringido. |
| Acceso y trazabilidad | Las épicas anteriores exigen acceso según responsabilidad y registro de consultas, exportaciones y cambios sensibles. |
| Ubicación | La operación actual está en Guatemala; los catálogos no deben exigir estados o provincias de otros países. |

### Decisiones pendientes para validar con el cliente

1. **Datos obligatorios:** definir nombres legales y preferidos, identificadores, contactos, dirección, emergencia, nacionalidad y demás campos necesarios para el expediente guatemalteco.
2. **Fuente e identificador:** confirmar cómo se genera el número de empleado, qué sistema es la fuente maestra y en qué casos se permite un alta manual.
3. **Responsables de edición:** definir qué campos edita RR. HH., cuáles puede actualizar el empleado y cuáles requieren aprobación o respaldo.
4. **Estructura formal:** confirmar unidades, niveles, puestos, responsables y tratamiento de socios o personas con más de una línea de reporte.
5. **Proyectos y clientes:** decidir si las asignaciones de auditoría se administran aquí, qué datos de clientes pueden mostrarse y cómo influyen en accesos y calendarios.
6. **Niveles de acceso:** detallar las facultades de empleado, supervisor, gerente, socio, RR. HH., TI, Cumplimiento, auditor y niveles personalizados.
7. **Permisos por campo:** clasificar la sensibilidad de cada dato y decidir quién puede verlo, editarlo y exportarlo según su relación con el empleado.
8. **Campos configurables:** confirmar quién puede crearlos, el proceso de aprobación y las reglas para retirar campos que contienen datos.
9. **Bajas y recontrataciones:** definir estados laborales, momento de revocar accesos, tratamiento de reingresos y conservación del expediente inactivo.
10. **Exportaciones:** confirmar formatos, límites, justificación, protección y perfiles autorizados.
11. **Integraciones:** identificar si directorio, cuentas, correo, nómina u otros sistemas recibirán o enviarán datos del empleado.
12. **Privacidad y conservación:** validar con el asesor los datos que pueden mostrarse internamente, los plazos de bitácoras y expedientes, y los derechos de consulta o corrección.

### Criterio de éxito de la épica

Cada empleado activo tiene un único expediente básico con datos vigentes, una ubicación clara en la estructura formal y visibilidad adecuada en el directorio. RR. HH. puede mantener la información sin perder historial, mientras empleados, responsables, TI y funciones de control acceden únicamente a los campos y personas que necesitan, con trazabilidad de las acciones sensibles.
