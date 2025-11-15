# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Paper is a full-stack application combining a Vue 3 frontend with two backend services:
- **PocketBase** (SQLite backend) - Primary database and authentication
- **Axum API** (Rust) - Metadata scraping service for URLs

## Development Commands

### Frontend (Vue + Vite)

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Backend Services

```bash
# Start PocketBase (http://localhost:8090)
./.pocketbase/pocketbase-31-darwin-arm64 serve

# Start Axum metadata API (http://localhost:8091)
cd .axum
cargo run

# Or run in background
cd .axum && cargo run &
```

## Architecture

### Frontend Stack

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite (using Rolldown as the bundler)
- **Router**: Vue Router with file-based routing (`unplugin-vue-router`)
- **State Management**: Pinia stores
- **Styling**: UnoCSS (Wind preset)
- **Internationalization**: Vue I18n
- **Auto Imports**: Components, composables, and stores are auto-imported

### Key Frontend Patterns

**File-based Routing**: Pages are automatically generated from `src/pages/` directory. Routes are typed in `src/typed-router.d.ts`.

**Auto-imports**: Vue APIs, VueUse composables, stores, and custom composables from `src/composables/` and `src/stores/` are automatically imported.

**Authentication**: Global navigation guard (`src/guards/auth.guard.ts`) protects routes. Public routes are defined in the guard. Redirects unauthenticated users to `/sign-in`.

**PocketBase Integration**: Singleton instance created in `src/composables/use-pb.ts` connecting to `http://localhost:8090/`. Used throughout the app via the `usePb()` composable.

### State Management Pattern (Pinia)

The codebase follows a consistent pattern for Pinia stores with PocketBase integration:

**Store Structure** (see `src/stores/tag.ts` as reference):
- Reactive state with refs (tags array, loading states, errors)
- Computed getters for derived state
- CRUD actions (fetchAll, fetchOne, create, update, remove)
- Real-time WebSocket subscriptions with PocketBase
- HMR support for hot module replacement

**Service Layer** (see `src/services/tag.service.ts` as reference):
- Pure functions for PocketBase API calls
- Type-safe CRUD operations
- WebSocket subscription helpers
- Detailed documentation in `src/services/README.md`

**WebSocket Pattern**: Stores subscribe to PocketBase real-time updates via `pb.collection().subscribe()`. The subscription handler automatically updates the local state on create/update/delete events. Always unsubscribe in `onUnmounted` or store cleanup.

### Backend Services

**PocketBase**: SQLite-based backend providing:
- Collections/tables with schema
- Authentication system
- Real-time subscriptions via WebSocket
- Admin UI at `http://localhost:8090/_/`

**Axum API** (`.axum/main.rs`): Rust service that:
- Scrapes URL metadata (title, description, favicon, preview image)
- Endpoint: `GET /api/metadata?url=<url>`
- Uses functional programming patterns with pure functions
- Implements CORS for frontend access
- Health check at `GET /health`

## Project Structure

```
src/
├── app-endpoint.vue          # Main app component with router-view
├── app-suspense.vue          # Suspense wrapper (if needed)
├── main.ts                   # App entry point
├── pages/                    # File-based routes
│   ├── index.vue
│   └── sign-in.vue
├── components/               # Vue components
│   ├── app/                  # App-level components
│   └── tag/                  # Tag management components
├── stores/                   # Pinia stores
│   ├── app.ts               # Global app state (theme, etc.)
│   └── tag.ts               # Tag management store
├── services/                 # API service layer
│   ├── tag.service.ts       # Tag CRUD & subscriptions
│   └── README.md            # Service documentation
├── composables/              # Reusable composables
│   └── use-pb.ts            # PocketBase singleton
├── guards/                   # Route guards
│   └── auth.guard.ts        # Authentication guard
├── modules/                  # Plugin configurations
│   ├── pinia.ts             # Pinia setup
│   ├── vue-i18n.ts          # i18n setup
│   └── vue-router.ts        # Router setup
├── styles/                   # Global styles
└── auto-imports.d.ts        # Auto-generated type definitions
```

## Important Configuration Notes

**Node Version**: Requires Node.js >= 22 (specified in `package.json`)

**Vite/Rolldown**: Uses `rolldown-vite` as a Vite replacement for faster builds. This is configured in both `dependencies` and `overrides`.

**Path Alias**: `~/` maps to `src/` directory for cleaner imports.

**Type Safety**: The project uses TypeScript with strict mode. Auto-generated types are in:
- `src/auto-imports.d.ts` - Auto-imported APIs
- `src/typed-router.d.ts` - File-based routes

**UnoCSS Shortcuts**:
- `body-primary` - Primary background and text colors with dark mode support
- `link` - Blue underlined links
- Custom icons from `src/assets/icons/` available as `i-mi-*`

## Adding New Features with PocketBase

When creating a new collection/feature similar to tags:

1. Create the collection in PocketBase admin UI
2. Create service file in `src/services/` with CRUD functions and subscription helpers
3. Create Pinia store in `src/stores/` following the tag store pattern
4. Create components in `src/components/[feature-name]/`
5. Add page in `src/pages/` (auto-routed)

## Testing Routes

Since the app uses file-based routing, test routes by:
1. Creating files in `src/pages/`
2. Routes are automatically available at the file path
3. Check `src/typed-router.d.ts` for available route names

## Common Issues

**PocketBase Connection**: Ensure PocketBase is running on `http://localhost:8090/` before starting the frontend.

**Auto-imports Not Working**: Run `npm run dev` to regenerate `auto-imports.d.ts` and `typed-router.d.ts`.

**Axum First-time Setup**: On first run, Cargo will download and compile dependencies (takes 1-2 minutes). Subsequent runs are fast.
