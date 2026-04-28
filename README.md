# FinanceTrack CO 💰

App PWA de finanzas personales para Colombia — React 18 + TypeScript + Supabase + Cloudflare Pages.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite 8 |
| Estilos | TailwindCSS v4 |
| Estado | Zustand |
| Router | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Gráficas | Recharts |
| Formularios | React Hook Form + Zod |
| PWA | vite-plugin-pwa (Workbox) |
| Deploy | Cloudflare Pages |

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/financetrack-co.git
cd financetrack-co
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Guardar la región más cercana (ej: South America)
3. En el **SQL Editor**, pegar y ejecutar el contenido completo de `supabase/schema.sql`
4. Verificar que las 6 tablas aparecen en **Table Editor**:
   - `transactions`, `debts`, `debt_payments`, `budgets`, `savings_goals`, `savings_contributions`

### 3. Obtener credenciales de Supabase

**Settings → API** y copiar:
- **Project URL** → `https://XXXXXXXXXX.supabase.co`
- **anon public** → `eyJhbGciOiJIUz...`

### 4. Variables de entorno local

Crear `.env.local` en la raíz del proyecto (nunca commitear):

```env
VITE_SUPABASE_URL=https://XXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 5. Configurar Google OAuth (opcional)

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear credenciales OAuth 2.0 → Web application
3. **Authorized redirect URIs:** `https://XXXXXXXXXX.supabase.co/auth/v1/callback`
4. En Supabase → **Authentication → Providers → Google** → pegar Client ID y Secret
5. Agregar también la URL de Cloudflare Pages en los redirect URIs cuando tengas el dominio

### 6. Ejecutar en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

---

## Deploy en Cloudflare Pages

### Paso 1 — Subir el repositorio a GitHub

```bash
git init
git add .
git commit -m "feat: initial commit FinanceTrack CO"
git remote add origin https://github.com/TU_USUARIO/financetrack-co.git
git push -u origin main
```

### Paso 2 — Crear el proyecto en Cloudflare Pages

1. Ir a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create**
2. Seleccionar **Pages → Connect to Git**
3. Conectar tu cuenta de GitHub y seleccionar el repo `financetrack-co`
4. Configurar el build:

| Campo | Valor |
|-------|-------|
| Framework preset | `None` (configuración manual) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `20` (en Environment variables) |

### Paso 3 — Variables de entorno en Cloudflare

En **Settings → Environment variables**, agregar para **Production** y **Preview**:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://XXXXXXXXXX.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUz...` |
| `NODE_VERSION` | `20` |

> ⚠️ Las variables de Vite **deben** empezar con `VITE_` para estar disponibles en el frontend.

### Paso 4 — Primer deploy

Hacer clic en **Save and Deploy**. Cloudflare Pages construirá y publicará automáticamente.

El archivo `public/_redirects` ya está configurado para que todas las rutas sirvan `index.html`:
```
/* /index.html 200
```

### Paso 5 — Dominio custom (opcional)

En **Custom domains → Add custom domain**, agrega tu dominio y sigue las instrucciones DNS.

Recuerda actualizar los redirect URIs en:
- Google OAuth Console
- Supabase → Authentication → URL Configuration → Site URL y Redirect URLs

### Deploy automático

Cada push a `main` dispara un nuevo deploy automático en Cloudflare Pages. Las ramas de preview también generan URLs de preview únicas.

---

## Estructura del proyecto

```
financetrack-co/
├── public/
│   ├── _redirects          # SPA routing para Cloudflare Pages
│   └── icons/              # Iconos PWA (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── charts/         # ExpenseDonut, MonthlyTrendChart
│   │   ├── layout/         # AppLayout, BottomNav, Sidebar, FAB, ProtectedRoute
│   │   └── ui/             # Modal, formularios, cards, skeletons, widgets
│   ├── hooks/              # useAuth, useTransactions, useDebts, useBudget,
│   │                       # useSavingsGoals, useDashboard
│   ├── lib/
│   │   ├── supabase.ts     # Cliente Supabase
│   │   ├── utils.ts        # formatCOP(), fechas, calcFinancialScore()
│   │   └── categoryIcons.ts
│   ├── pages/              # Dashboard, Gastos, Deudas, Presupuesto, Metas,
│   │                       # Perfil, Login, Register
│   ├── stores/             # useAuthStore (Zustand)
│   └── types/              # index.ts, database.ts
├── supabase/
│   └── schema.sql          # Tablas + RLS + triggers
├── .env.local              # Variables locales (NO commitear)
└── vite.config.ts          # Build + PWA + code splitting
```

---

## Bundle optimizado

El build aplica code splitting manual para carga progresiva:

| Chunk | Contenido | Cuándo carga |
|-------|-----------|--------------|
| `vendor-react` | React + ReactDOM | Siempre |
| `vendor-router` | React Router | Siempre |
| `vendor-supabase` | Supabase JS | Siempre |
| `vendor-recharts` | Recharts + react-is | Solo al abrir Dashboard |
| `vendor-forms` | React Hook Form + Zod | Al abrir formularios |
| `vendor-utils` | Zustand + date-fns + clsx | Siempre |
| Páginas | Dashboard, Gastos, etc. | Lazy — al navegar |

---

## Fases completadas

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Setup + Auth + Layout base | ✅ |
| 2 | Gastos (CRUD, filtros, swipe-to-delete) | ✅ |
| 3 | Deudas (abonos, historial, semáforos) | ✅ |
| 4 | Presupuesto mensual (alertas 80/100%) | ✅ |
| 5 | Metas de ahorro (aportes, proyección, confetti) | ✅ |
| 6 | Dashboard (gráficas Recharts, score financiero) | ✅ |
| 7 | PWA + Code splitting + Cloudflare Pages | ✅ |

---

## Seguridad

- **RLS activo** en todas las tablas — cada usuario solo accede a sus datos (`auth.uid() = user_id`)
- **Triggers** en BD actualizan `paid_amount` y `current_amount` automáticamente
- **`.env.local`** en `.gitignore` — credenciales nunca en el repo
- **Auth NetworkOnly** en Workbox — tokens JWT nunca se cachean
- **Supabase API NetworkFirst** — datos siempre frescos, con fallback a cache 24h

---

## Convenciones de código

- **Componentes:** `PascalCase.tsx`
- **Hooks:** `useNombre.ts`
- **Stores:** `useNombreStore.ts`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Formato COP:** siempre `formatCOP(amount)` de `@/lib/utils` → `$1.250.000`
