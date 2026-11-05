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

En `.env`, reemplazá `change-me` por una contraseña propia, tanto en `POSTGRES_PASSWORD` como dentro de `DATABASE_URL`. Usá solo letras y números, para no tener que codificar caracteres especiales en la URL. `.env` nunca se commitea.

## Base de datos

```bash
docker compose up -d   # levanta PostgreSQL en localhost:5432
docker compose ps      # el servicio "db" debe figurar como healthy
pnpm db:migrate        # aplica las migraciones pendientes
```

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

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

Para verificar la conexión con la base: [http://localhost:3000/api/health](http://localhost:3000/api/health) responde `200 {"status":"ok","database":"up"}`, o `503` si la base no está disponible.

## Scripts

| Script           | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm dev`       | Servidor de desarrollo con recarga en caliente (Turbopack).        |
| `pnpm build`     | Compila la aplicación para producción.                             |
| `pnpm start`     | Sirve la compilación de producción (requiere `pnpm build` previo). |
| `pnpm lint`      | Analiza el código con ESLint.                                      |
| `pnpm typecheck` | Genera los tipos de rutas de Next.js y valida TypeScript.          |
| `pnpm db:migrate`| Crea (si hay cambios en el schema) y aplica migraciones en desarrollo. |

## Estructura

```
src/
├── app/               # App Router: rutas, layouts y páginas
│   ├── layout.tsx     # Layout raíz (<html>, <body>, metadata, fuentes)
│   ├── page.tsx       # Ruta "/" (pantalla de bienvenida)
│   ├── globals.css    # Tailwind + tokens de diseño (colores, radios, fuentes)
│   └── api/health/    # Route Handler que verifica la conexión con la base
├── components/ui/     # Componentes de shadcn/ui (código propio del proyecto)
├── generated/prisma/  # Cliente de Prisma generado (no se versiona)
└── lib/
    ├── db.ts          # Instancia única de Prisma Client (solo servidor)
    └── utils.ts       # Helper `cn` para combinar clases
prisma/
├── schema.prisma      # Modelo de datos
└── migrations/        # Historial versionado de cambios en la base
public/                # Archivos estáticos
components.json        # Configuración de shadcn/ui
docker-compose.yml     # PostgreSQL local
prisma7.config.ts      # Configuración del CLI de Prisma (lee DATABASE_URL)
```

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
