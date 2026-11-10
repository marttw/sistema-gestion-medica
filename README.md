# Sistema de Gestión Médica

Aplicación web multiusuario para que médicos gestionen a sus pacientes. Proyecto en desarrollo incremental.

> ⚠️ Solo para uso con datos ficticios. No apto para pacientes reales sin una revisión de seguridad, privacidad y cumplimiento legal.

## Stack actual

- [Next.js 16](https://nextjs.org) con App Router
- React 19
- TypeScript (modo `strict`)
- Tailwind CSS 4
- shadcn/ui sobre Base UI
- PostgreSQL 17 (Docker) + Prisma ORM 7
- Better Auth (email y contraseña, sesiones en base de datos)
- React Hook Form + Zod
- Vitest
- ESLint (`eslint-config-next`)
- pnpm

## Requisitos

- Node.js **20.9 o superior**
- pnpm **11** (la versión exacta está en el campo `packageManager` de `package.json`). Con Corepack: `corepack enable`.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (en Windows, con WSL 2) para la base de datos local.

## Instalación

```bash
git clone https://github.com/marttw/sistema-gestion-medica.git
cd sistema-gestion-medica
pnpm install          # también genera el cliente de Prisma (postinstall)
cp .env.example .env  # completar con valores propios
```

En `.env`:

- Reemplazá `change-me` por una contraseña propia, tanto en `POSTGRES_PASSWORD` como dentro de `DATABASE_URL`. Usá solo letras y números, para no tener que codificar caracteres especiales en la URL.
- Generá `BETTER_AUTH_SECRET` con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- Elegí `SEED_DOCTOR_PASSWORD` (entre 8 y 128 caracteres): es la contraseña de la cuenta de prueba.

`.env` nunca se commitea.

## Base de datos

```bash
docker compose up -d   # levanta PostgreSQL en localhost:5432
docker compose ps      # el servicio "db" debe figurar como healthy
pnpm db:migrate        # aplica las migraciones pendientes
pnpm db:generate       # regenera el cliente de Prisma (Prisma 7 no lo hace al migrar)
pnpm db:seed           # crea la médica de prueba (solo desarrollo)
```

### Cuenta de prueba

No existe registro público. En desarrollo, `pnpm db:seed` crea una cuenta ficticia:

- **Correo:** `medica@example.com`
- **Contraseña:** el valor de `SEED_DOCTOR_PASSWORD` en tu `.env`

El seed se niega a ejecutarse en producción y no duplica la cuenta si ya existe.

Otros comandos útiles:

| Comando                      | Descripción                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `docker compose stop`        | Detiene la base (los datos se conservan).                    |
| `docker compose down -v`     | Elimina el contenedor **y los datos** (volumen).             |
| `pnpm prisma migrate status` | Muestra si la base está al día con las migraciones.          |
| `pnpm prisma studio`         | Abre una interfaz web para explorar los datos.               |

## Ejecución

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador. Sin sesión, te redirige a `/login`. Una vez dentro, el botón **Cerrar sesión** del encabezado cierra la sesión.

Para verificar la conexión con la base: [http://localhost:3000/api/health](http://localhost:3000/api/health) responde `200 {"status":"ok","database":"up"}`, o `503` si la base no está disponible.

## Scripts

| Script           | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm dev`       | Servidor de desarrollo con recarga en caliente (Turbopack).        |
| `pnpm build`     | Compila la aplicación para producción.                             |
| `pnpm start`     | Sirve la compilación de producción (requiere `pnpm build` previo). |
| `pnpm lint`      | Analiza el código con ESLint.                                      |
| `pnpm typecheck` | Genera los tipos de rutas de Next.js y valida TypeScript.          |
| `pnpm test`      | Ejecuta los tests una vez (Vitest). `pnpm test:watch` los re-ejecuta al guardar. |
| `pnpm db:migrate`| Crea (si hay cambios en el schema) y aplica migraciones en desarrollo. |
| `pnpm db:generate`| Regenera el cliente de Prisma a partir del schema.                 |
| `pnpm db:seed`   | Crea los datos de prueba de desarrollo.                            |

> En Windows, si PowerShell bloquea `pnpm` ("running scripts is disabled"), usá `pnpm.cmd` o habilitá scripts locales con `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Estructura

```
src/
├── app/               # App Router: rutas, layouts y páginas
│   ├── layout.tsx     # Layout raíz (<html>, <body>, metadata, fuentes)
│   ├── (private)/     # Páginas que requieren sesión (el grupo no aparece en la URL)
│   │   ├── layout.tsx # Layout privado: menú lateral + header + contenido
│   │   ├── page.tsx   # Ruta "/" (bienvenida)
│   │   └── patients/  # Ruta "/patients" (por ahora, placeholder)
│   ├── login/         # Ruta "/login" (pública)
│   ├── globals.css    # Tailwind + tokens de diseño (colores, radios, fuentes)
│   └── api/
│       ├── auth/      # Endpoints de Better Auth
│       └── health/    # Route Handler que verifica la conexión con la base
├── components/
│   ├── layout/        # Menú lateral, header y configuración de la navegación
│   └── ui/            # Componentes de shadcn/ui (código propio del proyecto)
├── features/
│   └── auth/          # Login, logout y acceso a la sesión (requireSession)
├── generated/prisma/  # Cliente de Prisma generado (no se versiona)
├── hooks/             # Hooks de React compartidos (p. ej., useIsMobile)
├── proxy.ts           # Redirección rápida al login si no hay cookie de sesión
└── lib/
    ├── auth.ts        # Configuración de Better Auth
    ├── db.ts          # Instancia única de Prisma Client (solo servidor)
    └── utils.ts       # Helper `cn` para combinar clases
prisma/
├── schema.prisma      # Modelo de datos
├── migrations/        # Historial versionado de cambios en la base
└── seed.ts            # Datos de prueba de desarrollo
public/                # Archivos estáticos
components.json        # Configuración de shadcn/ui
docker-compose.yml     # PostgreSQL local
prisma7.config.ts      # Configuración del CLI de Prisma (lee DATABASE_URL)
vitest.config.mts      # Configuración de los tests
```

Los tests viven junto al código que prueban (`*.test.ts`).

## Rutas privadas y autorización

La protección tiene dos capas:

1. **`src/proxy.ts` (control optimista):** si no hay cookie de sesión, redirige a `/login` antes de renderizar. Es rápido, pero no consulta la base, así que acepta cualquier cookie.
2. **`requireSession()` (control seguro):** valida la sesión contra la base (que exista, que no haya vencido y que no se haya cerrado). Si no es válida, redirige a `/login`. Si lo es, devuelve `{ id, name, email }` del médico.

**Regla:** toda página, Server Action o Route Handler privado debe llamar a `requireSession()` (de `@/features/auth/session`) antes de leer o modificar datos. Las páginas nuevas que requieren sesión van dentro de `src/app/(private)/`.

## Navegación

El área privada comparte un layout (`src/app/(private)/layout.tsx`):

- Un menú lateral, que en escritorio se puede colapsar a íconos (`Ctrl+B`) y en móvil se abre como panel deslizable.
- Un header con el médico autenticado y el botón para cerrar sesión.
- El área de contenido.

Para agregar una sección al menú:

1. Creá la página dentro de `src/app/(private)/` (por ejemplo `src/app/(private)/turnos/page.tsx`) y validá la sesión con `requireSession()`.
2. Agregá una entrada en `NAV_ITEMS` (`src/components/layout/navigation.ts`) con el título, la ruta y un ícono de `lucide-react`.

El menú marca la sección activa automáticamente, también en sus subrutas (por ejemplo `/patients/123`).

## Estilos y componentes

- Los colores y radios se definen como variables CSS en `src/app/globals.css` (`:root` para modo claro, `.dark` para oscuro) y se exponen como clases de Tailwind (`bg-primary`, `text-muted-foreground`, etc.). Para cambiar la paleta, se modifican esas variables.
- Para agregar un componente de shadcn/ui:

  ```bash
  pnpm dlx shadcn@latest add <componente>
  ```

  El código se copia en `src/components/ui/` y pasa a ser parte del proyecto.

### Convención para nuevas carpetas

Las carpetas se crean cuando una funcionalidad real las necesita:

- `src/components/` — componentes de UI compartidos.
- `src/features/<dominio>/` — código agrupado por dominio (por ejemplo, `features/patients/`), separado en componentes, esquemas de validación, acciones de servidor, servicios y repositorios.
- `src/lib/` — utilidades e infraestructura (base de datos, autenticación).

El código se escribe en inglés y la interfaz en español.
