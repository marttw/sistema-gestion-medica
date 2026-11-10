# Estado del proyecto

Registro de cada user story completada: qué se hizo, cómo y por qué. Complementa al [README](README.md), que explica cómo instalar y ejecutar el proyecto. Este archivo explica cómo llegamos hasta acá.

| US | Linear | Título | Estado |
| --- | --- | --- | --- |
| US-01 | SIS-8 | Inicializar proyecto Next.js con TypeScript | ✅ Mergeada (PR #1) |
| US-02 | SIS-9 | Configurar Tailwind CSS y shadcn/ui | ✅ Mergeada (PR #2) |
| US-03 | SIS-10 | Configurar PostgreSQL y Prisma ORM | ✅ Mergeada (PR #3) |
| US-04 | SIS-11 | Implementar login de médicos | ✅ Mergeada (PR #4) |
| US-05 | SIS-12 | Proteger rutas privadas e implementar logout | ✅ Mergeada (PR #5) |
| US-06 | SIS-13 | Crear layout principal y menú de navegación | ✅ Completa |

---

## US-01: Inicializar proyecto Next.js con TypeScript

**Fecha:** 2026-11-04

### Qué se hizo

- Se creó el proyecto con `create-next-app` 16.4.5: App Router, TypeScript, ESLint, carpeta `src/` y alias `@/*`.
- Se quitó el contenido de demostración de la plantilla y se agregó una pantalla de bienvenida en español.
- Se agregó el script `typecheck` (`next typegen && tsc --noEmit`).
- Se escribió el README y se configuró Git: el commit inicial con `CLAUDE.md` va en `main` y cada story se trabaja en su propia rama.

### Herramientas y para qué las usamos

- **Next.js (App Router):** framework full stack sobre React. Resuelve el ruteo (las carpetas definen las URLs), el renderizado en el servidor y el backend (Route Handlers y Server Actions) en un solo proyecto. Así no necesitamos un servidor aparte, como pasaría con React + Vite.
- **TypeScript strict:** detecta errores de tipos en tiempo de compilación.
- **ESLint:** detecta errores y malas prácticas en el código.
- **pnpm:** gestor de paquetes. Es más rápido que npm y usa menos espacio en disco. La versión queda fijada en `packageManager` dentro de `package.json`.

### Decisiones

- **Carpeta `src/`:** separa el código de la configuración. Las carpetas futuras (`components/`, `features/`, `lib/`) se crean recién cuando una feature las necesita, no por adelantado.
- **Se mantuvieron `cacheComponents` y `partialPrefetching`:** son el default de Next 16.4, es decir, el nuevo modelo de caché.
- **`AGENTS.md` se versiona:** lo genera Next.js para que los asistentes de IA lean la documentación de la versión instalada (`node_modules/next/dist/docs/`).
- **`typecheck` incluye `next typegen`:** los tipos globales de rutas, como `LayoutProps`, se generan en `.next/`. Sin ese paso, `tsc` falla en un clon recién hecho.
- **Ramas con el nombre que propone Linear** (por ejemplo, `mortvillalba/sis-8-...`): Linear vincula el PR con la issue y la mueve sola a "In Progress" y "Done".

---

## US-02: Configurar Tailwind CSS y shadcn/ui

**Fecha:** 2026-11-04

### Qué se hizo

- Se instaló Tailwind CSS 4.3.4 con `@tailwindcss/postcss` y se creó `postcss.config.mjs`.
- Se inicializó shadcn/ui 4.23 (estilo `base-nova`) y se agregaron Button, Input, Label y Card.
- Se definieron los tokens de diseño en `globals.css`: teal como color principal y de foco, en modo claro y oscuro, y Geist como tipografía.
- La bienvenida incluye una card temporal para probar los componentes. Se reemplaza por el login en la US-04.

### Herramientas y para qué las usamos

- **Tailwind CSS:** estilos con clases utilitarias (`flex`, `p-4`, `bg-primary`) escritas directamente en el JSX. En la versión 4 la configuración vive en el CSS (`@import "tailwindcss"`, `@theme`) y ya no existe `tailwind.config.js`.
- **shadcn/ui:** colección de componentes accesibles. No se instala como dependencia: el CLI copia el código a `src/components/ui/`, y desde ahí es nuestro y lo podemos modificar.
- **Base UI:** primitivas sin estilos que resuelven el comportamiento accesible (foco, teclado, ARIA). shadcn le pone los estilos con Tailwind.
- **`class-variance-authority` (cva) y `cn`:** `cva` define variantes tipadas (`variant="outline"`) y `cn` combina clases resolviendo los conflictos.

### Decisiones

- **Base UI en lugar de Radix:** es el default de shadcn desde julio de 2026, lo mantiene el mismo equipo que hizo Radix, y Radix sigue soportado.
- **Teal como color principal:** se cambia en un solo lugar, la variable `--primary`. Los tokens del sidebar la reutilizan con `var(--primary)`.
- **Se corrigió un error de shadcn:** generaba `--font-sans: var(--font-sans)`, una variable que se apunta a sí misma, y eso dejaba la fuente indefinida. Ahora apunta a `--font-geist-sans`.
- **Dark mode sin toggle:** los tokens oscuros existen, pero para activarlos hace falta `next-themes`, y quedó fuera de alcance. La app se ve en modo claro.

---

## US-03: Configurar PostgreSQL y Prisma ORM

**Fecha:** 2026-11-05

### Qué se hizo

- Se instaló **Docker Desktop** (con WSL 2) en la máquina de desarrollo.
- Se creó `docker-compose.yml`, que levanta PostgreSQL 17 con `docker compose up -d`.
- Se instaló Prisma ORM 7.10.1 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`) y se inicializó con `prisma init`.
- Se creó la migración inicial `init`, vacía, y se aplicó.
- Se creó `src/lib/db.ts` con la instancia única de Prisma Client.
- Se creó el endpoint `GET /api/health`, que ejecuta `SELECT 1` y responde 200 si hay conexión o 503 si no.

### Herramientas y para qué las usamos

- **PostgreSQL:** base de datos relacional donde se guardarán médicos, sesiones y pacientes. Es un servidor independiente de la app, que se conecta a él por red.
- **Docker / Docker Compose:** ejecuta PostgreSQL dentro de un contenedor, sin instalarlo en Windows. `docker-compose.yml` define versión, puerto y volumen, así que cualquiera que clone el repo obtiene la misma base. Los datos viven en un volumen (`postgres-data`) y sobreviven a los reinicios del contenedor.
- **Prisma ORM:** a partir del modelo declarado en `prisma/schema.prisma` genera un cliente tipado para consultar la base desde TypeScript, y además administra las migraciones.
- **Migraciones:** historial versionado de los cambios del esquema, guardado como archivos SQL en git. `prisma migrate dev` las crea y aplica en desarrollo; `migrate deploy` las aplica en producción.
- **`pg` y `@prisma/adapter-pg`:** en Prisma 7 la conexión pasa por un *driver adapter*. `pg` es el driver de Node.js para PostgreSQL y maneja un pool de conexiones reutilizables.
- **`dotenv`:** carga `.env` para el CLI de Prisma (`prisma7.config.ts`). Next.js carga `.env` por su cuenta.

### Decisiones

- **Docker en lugar de PostgreSQL nativo o en la nube:** es reproducible, no ensucia el sistema y es lo más usado en la industria.
- **Prisma 7.10.1 y no "latest":** en npm, `latest` apunta a una release candidate de Prisma 8. Usamos la última versión estable.
- **Credenciales fuera del repo:** `docker-compose.yml` lee usuario y contraseña de `.env`, que está ignorado por git. Solo se versiona `.env.example`, con valores ficticios. El puerto se abre únicamente en `127.0.0.1`.
- **Migración inicial vacía:** inicia el historial de migraciones sin crear tablas que después habría que borrar. Las primeras tablas reales llegan con la autenticación (US-04).
- **`/api/health` como Route Handler:** es un endpoint HTTP que cualquier cliente puede consultar, incluidas herramientas de monitoreo. Usa `await connection()` para que Next no intente consultar la base durante el build. Ante un error devuelve 503 sin detalles internos; el error completo queda solo en el log del servidor.
- **`db.ts` con `import "server-only"`:** si un Client Component lo importa, el build falla. Así el acceso a la base queda garantizado del lado del servidor. El patrón `globalThis` evita abrir un pool de conexiones nuevo en cada hot reload.
- **El cliente generado no se versiona:** vive en `src/generated/prisma` (ignorado por git) y el script `postinstall` lo regenera con `prisma generate`. Corrección posterior (US-04): en Prisma 7.10, `migrate dev` **no** regenera el cliente, así que después de migrar hay que correr `pnpm db:generate`.
- **Se borraron las "skills" de IA que instaló `prisma init`:** las había instalado sin avisar en `.agents/`, `.claude/` y `.windsurf/`, y varias no aplicaban al proyecto.
- **Se habilitaron los scripts de build de `prisma` y `@prisma/engines`** en `pnpm-workspace.yaml`: descargan el binario que ejecuta las migraciones. Los de `sharp` y `unrs-resolver` siguen bloqueados porque no son necesarios.

---

## US-04: Implementar login de médicos

**Fecha:** 2026-11-05

### Qué se hizo

- Se integró **Better Auth 1.7.17** con el adaptador de Prisma, login por email y contraseña, y el registro público desactivado (`disableSignUp`).
- Se crearon las tablas de autenticación (`user`, `session`, `account`, `verification`) con la migración `add_better_auth`.
- Se creó la pantalla `/login`, con un formulario hecho con React Hook Form y Zod, y una Server Action `login` que valida de nuevo en el servidor.
- La pantalla principal `/` saluda al médico autenticado y redirige a `/login` si no hay sesión. `/login` redirige a `/` si ya hay sesión.
- Se agregó `pnpm db:seed`, que crea a la médica ficticia "Dra. Ana Pérez" (`medica@example.com`) solo en desarrollo.
- Se configuró **Vitest** con 11 tests: 6 para el schema y 5 para la Server Action.

### Herramientas y para qué las usamos

- **Better Auth:** biblioteca de autenticación. Hashea las contraseñas (scrypt), crea y valida las sesiones, emite la cookie y aplica rate limiting. Nosotros nunca guardamos contraseñas ni generamos tokens a mano.
- **Sesiones en base de datos:** al iniciar sesión, Better Auth guarda una fila en `session` y envía al navegador solo un token aleatorio en una cookie `HttpOnly` (JavaScript no la puede leer) y `SameSite=Lax` (protege contra CSRF), válida por 7 días. En producción, con HTTPS, además la marca como `Secure`. En cada request, el servidor busca ese token en la base.
- **Zod:** define el schema de validación una sola vez. Lo usa el formulario, para dar feedback inmediato, y la Server Action, como validación real, porque al servidor nunca le alcanza con lo que validó el cliente.
- **React Hook Form:** maneja el estado del formulario y los errores por campo con pocos re-renders. Se conecta con Zod mediante `@hookform/resolvers`.
- **Server Actions:** funciones `"use server"` que el formulario llama como si fueran funciones comunes; Next las convierte en un POST al servidor. El plugin `nextCookies()` de Better Auth permite que una Server Action escriba la cookie de sesión.
- **Vitest:** test runner compatible con Vite. Los tests de la Server Action reemplazan Better Auth, `headers()` y `redirect()` con mocks (`vi.mock`), para probar la lógica sin base de datos.
- **`tsx`:** ejecuta TypeScript directamente en Node. Lo usamos para el seed.

### Decisiones

- **Un mismo mensaje de error para "usuario inexistente" y "contraseña incorrecta"** ("Correo electrónico o contraseña incorrectos."). Así nadie puede averiguar qué correos están registrados (*user enumeration*). El rate limiting (429) tiene su propio mensaje, porque no revela nada. Los errores inesperados se registran en el log del servidor y el usuario ve un mensaje genérico.
- **La sesión se lee dentro de `<Suspense>`:** con Cache Components, leer cookies o headers fuera de `<Suspense>` es un error de build. Por eso `/` y `/login` son *Partial Prerender*: una cáscara estática que carga al instante, más una parte dinámica que lee la sesión. Las redirecciones desde esa parte llegan por el stream (HTTP 200 con redirect en el cliente), no como un 307.
- **`getSession()` en `src/features/auth/session.ts`:** es el único punto desde el que se lee la sesión, el inicio de una "Data Access Layer". La US-05 lo va a usar para proteger todas las rutas y operaciones.
- **Seed con la API interna de Better Auth** (`ctx.password.hash` + `internalAdapter`): crea el usuario con el mismo hashing y el mismo formato que usaría el registro, sin habilitar un endpoint público. La contraseña sale de `SEED_DOCTOR_PASSWORD` (en `.env`), y el seed se niega a correr en producción y no duplica la cuenta.
- **Better Auth 1.7.17 en lugar de 1.7.18:** la 1.7.18 se había publicado hacía horas, y pnpm 11 bloquea versiones con menos de 24 h (protección de cadena de suministro). En lugar de agregar excepciones, usamos la versión anterior. Para destrabar el lockfile hubo que restaurarlo desde `main`, porque pnpm lo verifica antes de modificarlo.
- **Modelos de auth escritos a mano:** el CLI de Better Auth (`auth generate`) se niega a cargar configuraciones que importan `server-only`, aunque sea de forma indirecta. Los modelos se tomaron de la definición del propio paquete instalado (`getAuthTables`) y se pasaron a Prisma con las convenciones de su generador.
- **`server-only` instalado como paquete:** Next lo resuelve solo, pero los scripts que corren fuera de Next (el seed) lo necesitan. Se ejecutan con la condición `--conditions=react-server`, que hace que `server-only` no falle. `auth.ts` no lo importa directamente (por el CLI), pero queda protegido porque importa `db.ts`, que sí lo hace.
- **`vitest.config.mts`:** la extensión `.mts` marca la configuración como ESM y evita un aviso de Vite.
- **Fuera de alcance:** logout, protección general de rutas y `proxy.ts` (US-05). Hasta entonces, para probar el login otra vez hay que borrar la cookie `better-auth.session_token` desde DevTools.

---

## US-05: Proteger rutas privadas e implementar logout

**Fecha:** 2026-11-06

### Qué se hizo

- Se separó la protección en dos capas:
  - **Control optimista:** `src/proxy.ts` revisa que exista la cookie de sesión y, si no está, responde con un 307 a `/login`.
  - **Control seguro:** `requireSession()` (en `src/features/auth/session.ts`) valida la sesión contra la base de datos.
- Se creó el route group `src/app/(private)/`. Todas las páginas que viven ahí comparten un layout con un encabezado que muestra el nombre del médico y el botón "Cerrar sesión". La página principal se movió adentro y su URL sigue siendo `/`.
- Se agregó la Server Action `logout`: borra la sesión de la base y la cookie, y redirige a `/login`.
- Se agregaron estados de carga: skeletons de shadcn mientras se valida la sesión, y "Cerrando sesión…" durante el logout.
- Se agregaron 8 tests (19 en total): `requireSession`, `logout` y el proxy (redirecciones y `matcher`).

### Herramientas y para qué las usamos

- **`proxy.ts`** (en versiones anteriores de Next se llamaba `middleware.ts`): código que corre antes de cada request que coincide con su `matcher`. Lo usamos solo para la redirección rápida. No consulta la base porque se ejecuta en cada navegación y en cada *prefetch*.
- **`getSessionCookie()`** de `better-auth/cookies`: lee la cookie de sesión sin validarla. Sirve para el proxy, nunca para autorizar.
- **`auth.api.getSession()`:** busca el token en la tabla `session` y descarta las sesiones vencidas o cerradas. Es la verificación real.
- **`cache()` de React:** si el layout y la página piden la sesión en el mismo render, la base se consulta una sola vez.
- **Route groups (`(private)`):** carpetas entre paréntesis que agrupan rutas y les dan un layout común, sin agregar un segmento a la URL.
- **`useActionState`:** conecta un `<form action>` con una Server Action. Da `isPending` y el valor que devuelve la acción (para mostrar errores). Además, el formulario funciona aunque JavaScript todavía no haya cargado.
- **`next/experimental/testing/server`:** utilidades oficiales para testear el proxy y su `matcher`.

### Decisiones

- **El proxy no alcanza para proteger:** acepta cualquier cookie con el nombre correcto, incluso una inventada. Por eso cada página, Server Action y Route Handler privado llama a `requireSession()`. Los tests e2e lo comprueban: una cookie falsificada pasa el proxy, pero `requireSession()` la rechaza.
- **El proxy no redirige `/login` → `/` aunque haya cookie:** si la cookie es de una sesión vencida, `/` mandaría de vuelta a `/login` y se produciría un bucle infinito. Ese caso lo resuelve `/login` en el servidor, consultando la base.
- **El `matcher` excluye `/api`, `_next` y los archivos estáticos:** las APIs se autorizan por su cuenta y los recursos estáticos no deben bloquearse. Las Server Actions se envían como POST a la página donde se usan, así que el proxy también corre para ellas, pero igual validan la sesión por su cuenta.
- **`requireSession()` devuelve un DTO `{ id, name, email }`:** el resto de la app nunca recibe el token ni la sesión completa.
- **El logout invalida la sesión en el servidor:** como las sesiones viven en la base, `signOut` borra la fila y la cookie anterior deja de servir al instante, en cualquier navegador. Con un JWT autocontenido esto no sería posible sin una lista de revocación.
- **Sesiones expiradas:** Better Auth ignora las sesiones cuyo `expiresAt` ya pasó, así que `requireSession()` redirige al login sin código adicional.
- **`useActionState` en lugar de `useFormStatus`:** además del estado de carga, permite mostrar un error si el logout falla. En ese caso el mensaje es genérico y el detalle queda solo en el log del servidor.
- **La sesión no se lee en el nivel superior del layout:** si lo hiciera, toda la página esperaría a la base. El nombre del médico se carga dentro de `<Suspense>`, como recomienda la guía de Cache Components.
- **`unstable_doesMiddlewareMatch`:** la documentación de Next 16.4.5 la llama `unstable_doesProxyMatch`, pero el paquete todavía la exporta con el nombre viejo.

---

## US-06: Crear layout principal y menú de navegación

**Fecha:** 2026-11-09

### Qué se hizo

- Se armó el layout privado (`src/app/(private)/layout.tsx`):
  - Un menú lateral, que en escritorio se colapsa a íconos y en móvil se convierte en un panel deslizable.
  - Un header con el nombre y el email del médico, y el botón "Cerrar sesión".
  - El área de contenido.
- El menú tiene una sola opción, "Pacientes", y marca la sección activa (también en sus subrutas).
- Se creó `/patients` como página placeholder ("Próximamente"). La US-07 la va a reemplazar por el ABM.
- La pantalla principal muestra un mensaje de bienvenida que invita a usar el menú.
- Cada página define su título, y un *template* agrega el nombre del sistema: "Pacientes | Sistema de Gestión Médica".
- Se agregaron 5 tests (24 en total) para la configuración del menú y la lógica de "sección activa".

### Herramientas y para qué las usamos

- **Sidebar de shadcn/ui** (`pnpm dlx shadcn@latest add sidebar`): resuelve el menú lateral, el colapso, el atajo `Ctrl+B`, el panel móvil (un `Sheet`) y la accesibilidad. Además agregó `sheet`, `tooltip` y el hook `useIsMobile`.
- **Layouts anidados:** el layout raíz envuelve al layout privado, y este a cada página. El layout privado persiste entre navegaciones: al ir de `/` a `/patients`, solo se reemplaza el contenido; el menú y el header no se vuelven a montar.
- **`usePathname()`:** hook de Next que devuelve la URL actual. Lo usa `NavMain` para marcar la sección activa. Por eso es el único componente del menú que es Client Component.
- **Prop `render` de Base UI:** permite que `SidebarMenuButton` se renderice como un `<Link>` de Next, con los estilos del menú y la navegación del lado del cliente. Es el equivalente a `asChild` de Radix.
- **`useSyncExternalStore`:** API de React para suscribirse a una fuente externa (acá, el media query del ancho de la pantalla).
- **`metadata.title.template`:** cada página define solo su nombre ("Pacientes"), y el layout raíz agrega el resto.

### Decisiones

- **El menú se define como datos:** `NAV_ITEMS`, en `src/components/layout/navigation.ts`, es la única fuente de las secciones. Agregar un módulo es agregar una entrada; no hay que tocar el layout ni el sidebar.
- **Separación de responsabilidades:**
  - `navigation.ts` define *qué* secciones hay.
  - `NavMain` decide *cuál* está activa.
  - `AppSidebar` y `AppHeader` arman la interfaz.
  - El layout solo compone las piezas.
  - Las páginas tienen el contenido.

  Ninguna de estas piezas sabe nada de pacientes.
- **`isActivePath` compara contra `href + "/"`:** un simple `startsWith("/patients")` también marcaría una ruta hermana como `/patients-archive`.
- **Placeholder en `/patients`:** permite probar la navegación y el menú activo de verdad, sin adelantar lógica de la US-07. Igual llama a `requireSession()`, como toda página privada.
- **`useIsMobile` reescrito con `useSyncExternalStore`:** la versión generada por shadcn hacía `setState` dentro de un `useEffect`, y ESLint (`react-hooks/set-state-in-effect`) lo marcó como error porque provoca renders en cascada. En el servidor asume escritorio, y el CSS oculta el menú de escritorio en móvil hasta que el cliente toma el control.
- **Textos de accesibilidad en español:** se tradujeron los textos para lectores de pantalla que shadcn trae en inglés ("Toggle Sidebar", "Sidebar").
- **Botón propio para colapsar el menú en escritorio** (`SidebarCollapseButton`): un botón circular en el borde del sidebar, con una flecha que indica hacia dónde se mueve (`‹` contraer, `›` expandir). Reemplaza al ícono de panel del header, que no comunicaba bien la acción. Cambia `aria-label` y `aria-expanded` según el estado. En móvil no se muestra: ahí el menú se abre con el botón del header, que solo aparece en pantallas chicas.
- **`SidebarInset` provee el `<main>`:** las páginas privadas usan un `<div>` como raíz, para no anidar dos `<main>`, que es HTML inválido.
- **El estado del menú (abierto o colapsado) no se recuerda entre visitas:** el Sidebar lo guarda en la cookie `sidebar_state`, pero para leerla habría que llamar a `cookies()` en el layout, lo que con Cache Components bloquearía toda la página. Siempre arranca expandido.
- **Servidores de prueba huérfanos:** al detener los `next start` de las pruebas de la US-05, el proceso de Node quedó vivo y seguía sirviendo el build viejo. Ahora el servidor se lanza con `exec` para que, al detenerlo, se cierre el proceso de Node.
