# QueueLess

Universal Expo app for Android, iOS, and web.

The `app/` directory contains file-based routes. Reusable API, auth storage, state,
and theme code lives under `src/`.

## Development

```bash
npm install
npm start
```

TypeScript and lint checks:

```bash
npx tsc --noEmit
npm run lint
```

By default, auth uses mock mode for UI development. To use the backend, set these
environment variables before starting Expo:

```bash
EXPO_PUBLIC_API_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## EAS publishing

```bash
npx eas-cli login
npx eas-cli build --platform all --profile production
npx eas-cli submit --platform all --profile production
```

Before store submission, configure store credentials in EAS and use a publicly
reachable HTTPS backend URL instead of the local development URL above.

## Production web build

Copy `.env.example` to `.env.local` and set the production API URL, then export
the static web build:

```bash
npm run build:web
```

Deploy the generated `dist/` directory to a static host such as Vercel,
Netlify, or GitHub Pages. The host must rewrite unknown paths to `index.html`
for Expo Router deep links such as `/seller/dashboard`.
