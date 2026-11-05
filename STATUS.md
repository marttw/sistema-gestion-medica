# Estado del proyecto

Registro de cada user story completada: qué se hizo, cómo y por qué. Complementa al [README](README.md), que explica cómo instalar y ejecutar el proyecto. Este archivo explica cómo llegamos hasta acá.

| US | Linear | Título | Estado |
| --- | --- | --- | --- |
| US-01 | SIS-8 | Inicializar proyecto Next.js con TypeScript | ✅ Mergeada (PR #1) |
| US-02 | SIS-9 | Configurar Tailwind CSS y shadcn/ui | ✅ Mergeada (PR #2) |
| US-03 | SIS-10 | Configurar PostgreSQL y Prisma ORM | ✅ Completa |

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
- **El cliente generado no se versiona:** vive en `src/generated/prisma` (ignorado por git) y el script `postinstall` lo regenera con `prisma generate`.
- **Se borraron las "skills" de IA que instaló `prisma init`:** las había instalado sin avisar en `.agents/`, `.claude/` y `.windsurf/`, y varias no aplicaban al proyecto.
- **Se habilitaron los scripts de build de `prisma` y `@prisma/engines`** en `pnpm-workspace.yaml`: descargan el binario que ejecuta las migraciones. Los de `sharp` y `unrs-resolver` siguen bloqueados porque no son necesarios.
