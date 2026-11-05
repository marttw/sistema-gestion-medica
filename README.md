# Sistema de Gestión Médica

Aplicación web multiusuario para que médicos gestionen a sus pacientes. Proyecto en desarrollo incremental.

> ⚠️ Solo para uso con datos ficticios. No apto para pacientes reales sin una revisión de seguridad, privacidad y cumplimiento legal.

## Stack actual

- [Next.js 16](https://nextjs.org) con App Router
- React 19
- TypeScript (modo `strict`)
- Tailwind CSS 4
- shadcn/ui sobre Base UI
- ESLint (`eslint-config-next`)
- pnpm

## Requisitos

- Node.js **20.9 o superior**
- pnpm **11** (la versión exacta está en el campo `packageManager` de `package.json`). Con Corepack: `corepack enable`.

## Instalación

```bash
git clone https://github.com/marttw/sistema-gestion-medica.git
cd sistema-gestion-medica
pnpm install
```

## Ejecución

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

| Script           | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm dev`       | Servidor de desarrollo con recarga en caliente (Turbopack).        |
| `pnpm build`     | Compila la aplicación para producción.                             |
| `pnpm start`     | Sirve la compilación de producción (requiere `pnpm build` previo). |
| `pnpm lint`      | Analiza el código con ESLint.                                      |
| `pnpm typecheck` | Genera los tipos de rutas de Next.js y valida TypeScript.          |

## Estructura

```
src/
├── app/               # App Router: rutas, layouts y páginas
│   ├── layout.tsx     # Layout raíz (<html>, <body>, metadata, fuentes)
│   ├── page.tsx       # Ruta "/" (pantalla de bienvenida)
│   └── globals.css    # Tailwind + tokens de diseño (colores, radios, fuentes)
├── components/ui/     # Componentes de shadcn/ui (código propio del proyecto)
└── lib/utils.ts       # Helper `cn` para combinar clases
public/                # Archivos estáticos
components.json        # Configuración de shadcn/ui
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
