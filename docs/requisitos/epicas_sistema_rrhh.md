# Épicas del sistema de gestión de Recursos Humanos

## 1. Propósito del documento

Este documento reúne diez épicas preliminares para un sistema de gestión de Recursos Humanos. Se construyeron a partir de las pantallas de referencia compartidas y consolidan las dieciocho épicas identificadas durante su revisión. Su propósito es servir como base para conversar con el cliente, delimitar el alcance y preparar un backlog.

Las pantallas permiten identificar funciones visibles, pero no confirman todas las reglas de negocio ni los flujos completos. Por ello, las descripciones expresan necesidades funcionales probables; cada épica deberá detallarse después mediante historias de usuario, reglas y criterios de aceptación acordados con el cliente.

## 2. Principios funcionales transversales

- **Datos de personal confiables:** el expediente debe ser una fuente consistente para los procesos que dependen de él.
- **Acceso según responsabilidad:** la información personal, salarial, médica y de candidatos debe mostrarse únicamente a usuarios autorizados.
- **Trazabilidad:** los cambios relevantes deben conservar fecha, responsable y, cuando corresponda, su vigencia.
- **Autoservicio claro:** el empleado debe poder consultar sus datos y completar las acciones que le correspondan sin depender de RR. HH. para cada paso.
- **Configuración por organización:** campos, tipos de ausencia, beneficios, estados y políticas deben definirse según la operación y el país aplicable.
- **Alcance verificable:** las opciones visibles en las pantallas no demuestran por sí solas que exista un flujo completo o una integración activa.

## 3. Épicas consolidadas

### EP-01. Portal del empleado y gestión de ausencias

**Descripción:** Ofrecer un inicio personalizado para consultar avisos, pendientes y datos relevantes, y permitir al empleado revisar sus saldos y solicitar tiempo libre.

**Valor de negocio:** Reduce consultas manuales a RR. HH. y da visibilidad a las ausencias que afectan la planificación del equipo.

**Capacidades principales:**

- Mostrar notificaciones, actividades pendientes, celebraciones, enlaces de la empresa y compañeros ausentes.
- Consultar saldos y horas programadas por tipo de ausencia.
- Registrar una solicitud con fechas, tipo de ausencia, cantidad y nota.
- Consultar ausencias próximas y el estado de las solicitudes, si el cliente confirma ese flujo.
- Presentar resúmenes de otras funciones, como objetivos y beneficios, con acceso al detalle correspondiente.

**Resultado esperado:** El empleado puede conocer su situación de tiempo libre y realizar una solicitud desde un punto de entrada sencillo.

**Dependencias y observaciones:** Deben confirmarse las políticas de acumulación, unidades de medida, días no laborables, aprobaciones y notificaciones. Las capturas muestran la solicitud y los saldos, pero no el proceso completo de aprobación.

### EP-02. Creación y publicación de vacantes

**Descripción:** Permitir que el equipo de contratación prepare vacantes y configure la información que verá y completará una persona candidata.

**Valor de negocio:** Estandariza la publicación de puestos y evita formularios incompletos o diferentes sin intención.

**Capacidades principales:**

- Crear y consultar vacantes con título, responsable, departamento, tipo de empleo, experiencia, ubicación, compensación y descripción.
- Manejar estados visibles como borrador y abierta.
- Seleccionar los datos y documentos que se solicitarán a los candidatos y cuáles serán obligatorios.
- Añadir preguntas de respuesta corta, larga, sí/no, opción múltiple, casilla o carga de archivos.
- Obtener un enlace a la vacante y seleccionar canales de difusión disponibles.

**Resultado esperado:** Cada vacante queda lista para recibir postulaciones mediante un formulario adecuado al puesto.

**Dependencias y observaciones:** La publicación en portales externos aparece como opción, pero deben confirmarse proveedores, condiciones y funcionamiento real de cada integración.

### EP-03. Selección y contratación de candidatos

**Descripción:** Dar seguimiento a las personas postuladas desde la revisión inicial hasta la decisión de contratación.

**Valor de negocio:** Mantiene la información y las comunicaciones de selección vinculadas a la vacante y al candidato correctos.

**Capacidades principales:**

- Consultar candidatos por vacante, perfil, currículum y documentos de postulación.
- Registrar calificaciones, notas y cambios de estado durante la selección.
- Enviar correos mediante plantillas editables, datos personalizados y archivos adjuntos.
- Preparar una carta de oferta con puesto, fecha de inicio, compensación y vencimiento.
- Registrar la decisión de contratar y ofrecer la opción de cerrar la vacante y crear el expediente del nuevo empleado.

**Resultado esperado:** El equipo puede seguir la evolución de cada candidatura y conservar una decisión final identificable.

**Dependencias y observaciones:** Deben definirse los estados, permisos, plantillas y reglas para pasar de candidato a empleado. Las pantallas no confirman aprobaciones internas ni firma de la oferta.

### EP-04. Administración de empleados y estructura organizacional

**Descripción:** Mantener el expediente básico de cada empleado y permitir consultar el directorio y la estructura de supervisión, con acceso controlado.

**Valor de negocio:** Proporciona una base común para contratación, ausencias, beneficios, desempeño, reportes y nómina.

**Capacidades principales:**

- Registrar empleados con identificador, datos personales y de contacto, puesto, ubicación y fecha de contratación.
- Consultar la lista de empleados y abrir sus perfiles.
- Visualizar el organigrama, localizar personas y exportar la estructura cuando esté permitido.
- Configurar campos del expediente según las necesidades acordadas.
- Asignar niveles de acceso a empleados, responsables y administradores.

**Resultado esperado:** La organización dispone de un directorio consistente y los usuarios acceden únicamente a los datos que necesitan.

**Dependencias y observaciones:** Deben definirse responsables de edición, datos obligatorios, permisos por campo y reglas de privacidad. Las capturas muestran niveles de acceso, pero no detallan todas sus facultades.

### EP-05. Incorporación de nuevos empleados

**Descripción:** Coordinar las actividades que siguen a la contratación y preparar al empleado para su primer día.

**Valor de negocio:** Reduce omisiones en la preparación del puesto y mejora la experiencia inicial del empleado.

**Capacidades principales:**

- Enviar un paquete de bienvenida con información del primer día.
- Permitir que el nuevo empleado complete datos personales y foto de perfil.
- Recoger respuestas de presentación para facilitar su introducción al equipo.
- Organizar tareas de RR. HH., TI, responsable directo y nuevo empleado, con fechas y responsables.
- Consultar el avance del paquete y las tareas desde el perfil del empleado.

**Resultado esperado:** Cada participante conoce lo que debe completar y RR. HH. puede detectar pendientes antes y después del inicio.

**Dependencias y observaciones:** La firma de documentos se menciona en tareas visibles; deben confirmarse el mecanismo, los documentos exigidos y el tratamiento de tareas vencidas.

### EP-06. Historial laboral y beneficios

**Descripción:** Conservar los cambios en la relación laboral y mostrar los beneficios asociados al empleado.

**Valor de negocio:** Facilita la consulta de condiciones vigentes y antecedentes sin reconstruirlos desde correos o archivos dispersos.

**Capacidades principales:**

- Registrar cambios de estado laboral, puesto, departamento, ubicación, responsable y compensación con fecha de vigencia.
- Consultar el historial de esas condiciones en el perfil.
- Mostrar beneficios, cobertura, vigencia, aportes del empleado y de la empresa, y frecuencia.
- Permitir campos configurables cuando una organización necesite información adicional.

**Resultado esperado:** RR. HH. puede identificar qué condiciones se aplican al empleado y desde cuándo.

**Dependencias y observaciones:** Deben confirmarse reglas de autorización de cambios, relación con nómina y administración de altas o bajas de beneficios. Las capturas muestran principalmente el registro y la consulta.

### EP-07. Documentos y capacitación

**Descripción:** Organizar documentos corporativos y del expediente individual, junto con el registro de capacitaciones de cada empleado.

**Valor de negocio:** Facilita encontrar evidencia de procesos de RR. HH. y conocer el avance formativo del personal.

**Capacidades principales:**

- Cargar, ordenar, buscar y descargar documentos, con carpetas de empresa y carpetas asociadas al empleado.
- Mantener formularios y plantillas de firma para procesos recurrentes.
- Mostrar capacitaciones próximas, vencidas y completadas, con fechas y categorías.
- Registrar una capacitación realizada y consultar el historial del empleado.

**Resultado esperado:** Los documentos y las capacitaciones se consultan desde lugares definidos, con acceso apropiado para cada rol.

**Dependencias y observaciones:** Deben acordarse permisos, versiones, conservación de archivos y quién puede registrar o confirmar una capacitación. La asignación automática de cursos no se demuestra en las capturas.

### EP-08. Objetivos y evaluaciones de desempeño

**Descripción:** Permitir el seguimiento de objetivos y la consulta de evaluaciones del empleado y su responsable.

**Valor de negocio:** Hace visibles los compromisos de desempeño y las evaluaciones pendientes durante el periodo correspondiente.

**Capacidades principales:**

- Crear objetivos y consultar su descripción, estado, avance y fecha límite.
- Registrar comentarios relacionados con un objetivo.
- Filtrar objetivos por estado.
- Consultar ciclos de evaluación, autoevaluación y evaluación del responsable.
- Identificar evaluaciones pendientes desde el perfil y el inicio.

**Resultado esperado:** Empleados y responsables pueden seguir los objetivos y localizar las evaluaciones que les corresponden.

**Dependencias y observaciones:** Deben definirse el método de medición del avance, la visibilidad de comentarios y las reglas de cada ciclo. La pestaña de retroalimentación es visible, pero su funcionamiento no está documentado por las capturas.

### EP-09. Reportes y análisis de satisfacción

**Descripción:** Ofrecer reportes sobre los procesos de RR. HH. y consultar indicadores agregados de satisfacción del personal.

**Valor de negocio:** Ayuda a detectar tendencias de personal y a responder preguntas de gestión con datos consistentes.

**Capacidades principales:**

- Consultar un catálogo de reportes estándar, recientes, propios y compartidos.
- Crear reportes personalizados mediante nombre y selección de campos del empleado.
- Analizar indicadores como rotación, plantilla, ausencias, beneficios e historial de cambios, según el reporte disponible.
- Consultar puntuación eNPS, participación, evolución por periodo y respuestas clasificadas por temas.
- Aplicar filtros y desgloses cuando el reporte los permita.

**Resultado esperado:** RR. HH. y dirección pueden acceder a información útil sin reconstruirla manualmente.

**Dependencias y observaciones:** Deben definirse permisos de consulta y exportación, fórmulas de indicadores y protección de respuestas individuales. Las capturas muestran resultados de satisfacción, pero no la creación o envío de encuestas.

### EP-10. Control de horas e información de nómina

**Descripción:** Permitir la consulta de horas trabajadas y recibos de pago, además del seguimiento de fechas y pendientes del proceso de nómina.

**Valor de negocio:** Da transparencia al empleado sobre sus pagos y al equipo responsable sobre los periodos que requieren atención.

**Capacidades principales:**

- Mostrar horas registradas por día y periodo de pago, estado de fichaje e historial de cambios.
- Consultar recibos de pago y su desglose de ingresos, impuestos, deducciones y pago neto.
- Descargar o imprimir un recibo.
- Consultar el historial de pagos y los acumulados mostrados en el perfil.
- Visualizar calendario, recordatorios y monto total del periodo, con acceso al sistema de nómina vinculado.

**Resultado esperado:** Empleados y responsables consultan información del periodo correcto y pueden identificar pendientes de nómina.

**Dependencias y observaciones:** Las capturas muestran un acceso a TRAXPayroll, pero no demuestran cómo se calcula o ejecuta la nómina. Deben confirmarse la fuente de las horas, permisos, correcciones e integración con el proveedor.

## 4. Decisiones de alcance y puntos por validar

1. **Las capturas representan una referencia funcional.** El cliente debe confirmar qué procesos necesita realmente; no se asume que deba reproducirse toda la aplicación observada.
2. **Las aprobaciones requieren definición.** Se ven solicitudes de ausencia y cambios, pero no la cadena de aprobación ni las excepciones.
3. **Las integraciones requieren comprobación.** Portales de empleo y nómina aparecen en pantalla; su proveedor, disponibilidad y alcance deben validarse.
4. **La información sensible requiere permisos detallados.** Expedientes, compensación, documentos, evaluaciones y recibos no deben compartir una regla de acceso genérica.
5. **La localización depende del cliente.** Formularios, beneficios, impuestos y documentos de las capturas corresponden a un ejemplo; los requisitos finales dependen de los países donde operará el sistema.

## 5. Priorización preliminar

### Fase 1. Base de personal y contratación

- EP-04 Administración de empleados y estructura organizacional, comenzando por expedientes, directorio y permisos básicos.
- EP-02 Creación y publicación de vacantes.
- EP-03 Selección y contratación de candidatos.
- EP-05 Incorporación de nuevos empleados.
- Capacidades mínimas de EP-07 para almacenar documentos necesarios.

### Fase 2. Operación cotidiana del empleado

- EP-01 Portal del empleado y gestión de ausencias.
- EP-06 Historial laboral y beneficios.
- EP-10 Control de horas e información de nómina, sujeto a la integración confirmada.
- Resto de capacidades de EP-07 para capacitación y biblioteca corporativa.

### Fase 3. Seguimiento y análisis

- EP-08 Objetivos y evaluaciones de desempeño.
- EP-09 Reportes y análisis de satisfacción.

Esta secuencia es una hipótesis de trabajo. El orden real debe ajustarse a los tres procesos prioritarios, la fecha objetivo y los sistemas que el cliente ya utiliza.

## 6. Preguntas abiertas para refinar las épicas

- ¿Qué tres procesos debe resolver la primera versión?
- ¿En qué países operará la empresa y qué tipos de empleados o contratos maneja?
- ¿Cuántos empleados, responsables, reclutadores y administradores usarán el sistema?
- ¿Qué datos y documentos existen hoy y desde dónde se migrarán?
- ¿Qué solicitudes requieren aprobación y quién decide en cada caso?
- ¿Cómo se calculan los saldos de ausencia y cómo se corrigen errores?
- ¿Qué sistema procesa la nómina y qué información debe intercambiar con esta solución?
- ¿Qué canales de empleo se utilizan y cuáles requieren integración?
- ¿Quién puede consultar compensación, evaluaciones, expedientes y respuestas de encuestas?
- ¿Qué indicadores y reportes necesita la dirección para considerar útil el sistema?

## 7. Criterio de éxito global

El sistema será exitoso cuando permita seguir de forma consistente el recorrido desde una vacante y su candidato hasta el alta del empleado, mantener su expediente y sus actividades cotidianas, y ofrecer a cada rol la información y las acciones que necesita con permisos adecuados y datos verificables.
