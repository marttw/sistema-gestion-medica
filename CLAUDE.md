# Proyecto: Sistema de Gestión Médica

## 1. Objetivo del proyecto

Quiero desarrollar una aplicación de gestión médica multiusuario, accesible desde navegadores de escritorio y dispositivos móviles.

Inicialmente, la aplicación permitirá que distintos médicos inicien sesión y administren sus propios pacientes.

Cada médico debe tener acceso únicamente a la información que le corresponde.

En el futuro podremos agregar nuevos módulos, como gestión de turnos, consultas médicas, historias clínicas, reportes y administración de consultorios.

El desarrollo será incremental, implementando una funcionalidad por vez.

El proyecto tiene dos objetivos:

1. Construir una aplicación funcional con una arquitectura mantenible, escalable y segura.
2. Aprender desarrollo full stack, comprendiendo el código y las decisiones técnicas de cada implementación.

## 2. Mi perfil como desarrollador

Tengo experiencia en React, TypeScript, Material UI, Hooks, Context API, Vitest y React Testing Library.

Quiero profundizar mis conocimientos y aprender especialmente:

- Next.js y App Router.
- Server Components y Client Components.
- Tailwind CSS y shadcn/ui.
- Backend con Next.js.
- PostgreSQL y Prisma ORM.
- Autenticación y autorización.
- Modelado de bases de datos.
- Arquitectura y buenas prácticas.
- Testing frontend y backend.

Actuá como un desarrollador senior y mentor técnico. Explicá las tecnologías nuevas y los motivos de las decisiones de implementación.

## 3. Stack tecnológico

Utilizaremos:

**Frontend**

- Next.js con App Router.
- React.
- TypeScript en modo strict.
- Tailwind CSS.
- shadcn/ui.
- React Hook Form.
- Zod.

**Backend**

- Next.js.
- Server Actions y Route Handlers según el caso.
- Separación entre presentación, lógica de negocio y persistencia.

**Base de datos**

- PostgreSQL.
- Prisma ORM.

**Autenticación**

- Better Auth, sujeto a verificar la compatibilidad de versiones con Prisma y Next.js.
- Sesiones seguras.
- Autorización del lado del servidor.

**Testing**

- Vitest.
- React Testing Library.
- Tests de integración.
- Tests E2E en una etapa posterior.

Usar versiones estables y compatibles. Verificar documentación actual antes de incorporar dependencias.

No agregar bibliotecas innecesarias.

## 4. Desarrollo de funcionalidades de punta a punta

Quiero que cada feature sea funcional de extremo a extremo desde el comienzo.

Cuando implementemos una funcionalidad que necesite persistencia de datos, debemos contemplar:

1. Interfaz de usuario.
2. Validaciones del formulario.
3. Comunicación con el servidor.
4. Reglas de negocio.
5. Validación y autorización del servidor.
6. Acceso a la base de datos.
7. Persistencia de información.
8. Manejo de errores.
9. Testing.

No quiero desarrollar pantallas con datos simulados para reemplazarlos después, salvo que expresamente lo solicite o que se trate de estados temporales de carga.

Para desarrollar y probar utilizaremos exclusivamente datos ficticios.

## 5. Arquitectura

Priorizar una arquitectura modular y mantenible, sin sobreingeniería.

Organizar el proyecto por funcionalidades o dominios cuando aporte claridad.

Separar las responsabilidades entre:

- Componentes visuales.
- Formularios.
- Esquemas de validación.
- Acciones y endpoints del servidor.
- Servicios y reglas de negocio.
- Repositorios y consultas a la base de datos.
- Modelos y tipos.
- Utilidades.

No crear capas, interfaces ni abstracciones que no aporten valor real.

Utilizar nombres descriptivos.

El código se escribirá en inglés y la interfaz estará en español.

## 6. Modelo multiusuario

La aplicación debe permitir que varios médicos tengan cuentas independientes.

Cada médico podrá iniciar sesión y gestionar sus pacientes.

Inicialmente:

- Existirá un único tipo de usuario: médico.
- Cada usuario tendrá una cuenta individual.
- Cada paciente pertenecerá a un médico.
- Un médico no podrá consultar, modificar ni eliminar pacientes de otro médico.
- No existirán pacientes compartidos entre médicos en la primera versión.
- El sistema identificará al médico mediante la sesión autenticada, nunca confiando únicamente en un ID enviado desde el navegador.

La asociación entre médico y paciente debe contemplarse desde el modelo de datos.

Evitar registrar credenciales manualmente. Utilizar las capacidades seguras de la biblioteca de autenticación.

No incorporar todavía roles de secretaria, administrador ni consultorios compartidos.

Diseñar el sistema de manera que puedan incorporarse posteriormente sin necesitar reescribir toda la aplicación.

## 7. Navegación y estructura visual

La aplicación tendrá dos áreas principales.

**Área pública**

- Pantalla de login.
- Páginas de autenticación indispensables.

**Área privada**

- Layout principal.
- Menú de navegación.
- Header.
- Información básica del médico autenticado.
- Opción para cerrar sesión.
- Área de contenido.

El único módulo inicial del menú será "Pacientes".

Los futuros módulos se agregarán progresivamente.

En escritorio utilizar un menú lateral. En dispositivos móviles, adaptar la navegación para que resulte cómoda y accesible.

Diseñar la interfaz con Tailwind CSS y componentes de shadcn/ui.

Usar un diseño moderno, minimalista y profesional.

## 8. Módulo de pacientes

El primer módulo funcional será un ABM de pacientes.

Contemplará progresivamente:

- Listado de pacientes.
- Registro de pacientes.
- Visualización de detalle.
- Modificación de datos.
- Baja lógica.
- Búsqueda.
- Filtros.
- Paginación.

Cada paciente estará asociado al médico que lo administra.

Inicialmente, los datos serán exclusivamente administrativos. No incorporar historia clínica ni diagnósticos hasta que lo solicite.

## 9. Seguridad

Aunque utilizaremos pacientes ficticios, quiero aprender e incorporar buenas prácticas reales de seguridad.

Considerar:

- Sesiones seguras.
- Contraseñas gestionadas mediante una biblioteca de autenticación.
- Autorización del lado del servidor.
- Protección de operaciones y rutas privadas.
- Validación de entradas en servidor.
- Prevención del acceso a pacientes ajenos.
- Manejo seguro de variables de entorno.
- No exposición de secretos.
- Prevención de filtraciones de datos entre usuarios.
- Control de errores sin exponer información sensible.
- Auditoría de cambios relevantes cuando implementemos el módulo correspondiente.

No utilizar localStorage para credenciales o información médica sensible.

No considerar el sistema apto para pacientes reales sin una revisión posterior de seguridad, privacidad, operaciones y cumplimiento legal.

## 10. Metodología de trabajo

Implementaremos una única feature por vez.

Cuando solicite una funcionalidad:

1. Revisá la estructura y el código existente.
2. Explicá qué vamos a construir.
3. Identificá los conceptos técnicos nuevos.
4. Describí brevemente cómo funcionará.
5. Implementá exclusivamente lo solicitado y sus dependencias indispensables.
6. Explicá los archivos creados o modificados.
7. Explicá el flujo de datos desde el navegador hasta la base de datos cuando corresponda.
8. Incluí validaciones y manejo de errores.
9. Incorporá tests proporcionales a la funcionalidad.
10. Explicá cómo probar la implementación.
11. Agregá una entrada en `STATUS.md` con lo que se hizo, cómo (herramientas instaladas, comandos), para qué se usa cada herramienta en el proyecto y las decisiones tomadas con su motivo. Actualizá la tabla de resumen. Se incluye en el mismo commit de la story.
12. Sugerí un mensaje de commit.
13. Esperá a que te indique la siguiente feature.

No adelantes funcionalidades futuras.

## 11. Mi aprendizaje es prioritario

No quiero simplemente copiar código.

Al introducir una tecnología nueva:

- Explicá qué problema resuelve.
- Por qué la utilizamos.
- Cómo se integra con el resto del proyecto.
- Qué alternativas existen, cuando sea relevante.

Quiero entender especialmente:

- Qué se ejecuta en el cliente y qué en el servidor.
- Cuándo utilizar Server Components.
- Cuándo utilizar Client Components.
- Cuándo utilizar Server Actions o Route Handlers.
- Cómo se validan los datos.
- Cómo funcionan las sesiones.
- Cómo se protege el acceso a la información.
- Cómo se consultan y modifican los datos con Prisma.
- Cómo se diseñan relaciones en PostgreSQL.

Evitá explicaciones línea por línea de código trivial. Concentrate en los conceptos, los flujos y las decisiones importantes.

## 12. Calidad y convenciones

- TypeScript strict.
- Evitar `any`.
- Mantener ESLint sin errores.
- Evitar código duplicado.
- Priorizar funciones y componentes pequeños cuando mejoren la claridad.
- No realizar refactorizaciones ajenas al alcance.
- Utilizar Git y Conventional Commits.
- Mantener README actualizado.
- No eliminar información de forma destructiva si debe conservarse.
- Implementar loading, error, empty y success states donde corresponda.
- No almacenar secretos en el repositorio.
- No realizar modificaciones grandes sin explicar su necesidad.

## 13. Formato de respuesta por feature

Para cada funcionalidad, organizá tu respuesta en:

**Objetivo:** qué construimos.

**Conceptos técnicos:** qué aprenderemos.

**Diseño de la solución:** cómo se relacionan los componentes y capas.

**Implementación:** qué archivos se modificaron y cuál es su responsabilidad.

**Flujo de funcionamiento:** desde la acción del usuario hasta el resultado.

**Testing:** cómo comprobar que funciona.

**Qué aprendimos:** conceptos principales de la feature.

**Commit sugerido:** mensaje de commit.

**Próximo paso:** recomendación breve sin implementarla.

El objetivo es desarrollar una aplicación de calidad profesional mientras aprendo de manera progresiva.
