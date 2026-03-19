# TokenLearn Frontend

React + Vite frontend for TokenLearn.

The client is a browser-based SPA that talks directly to the backend API and is
deployed as static files from `dist/`.

Detailed architecture notes: [docs/client-architecture.md](docs/client-architecture.md)

## Stack

- React 19
- React Router 7
- Vite
- ESLint
- Google Identity Services

## Project Layout

```text
client/
  src/
    pages/       route-level screens
    components/  reusable UI, guards, modals
    context/     app-wide state and action layer
    lib/         API client, Google auth, helpers
    i18n/        translations and RTL/LTR handling
    layouts/     shared authenticated shell
  public/
  docs/
  package.json
  vite.config.js
  README.md
```

More source-level guidance: [src/README.md](src/README.md)

## Environment Variables

Create one of:

- `.env` for local development
- `.env.local` for local overrides
- `.env.production` for production builds

Required variables:

```bash
VITE_API_BASE_URL=https://your-backend-host
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

### What each variable does

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL for all backend API requests. No trailing slash needed. |
| `VITE_GOOGLE_CLIENT_ID` | Required if using Google sign-in | Google OAuth Web Client ID used by the browser sign-in flow. |

Important:

- `VITE_*` variables are embedded at build time by Vite.
- Changing the API URL or Google client id requires rebuilding the app.
- The frontend and backend must use matching Google OAuth client configuration.

## Local Development

### Prerequisites

- Node.js 20+ recommended
- npm
- A running backend server

### 1. Configure local environment

Example `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

Vite prints the local URL in the terminal, usually:

```text
http://localhost:5173
```

### 4. Verify backend connectivity

Open the app and confirm:

- login/register pages load
- authenticated API calls reach the backend
- browser network requests go to `VITE_API_BASE_URL`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Authentication Notes

### Password login

- Credentials are sent to `POST /api/sessions`.
- The backend returns the application JWT.
- The client stores that JWT in `localStorage` under `authToken`.
- On refresh, the app verifies the token and reloads `/api/users/me`.

### Google sign-in

When users choose Google login:

1. The browser loads Google Identity Services.
2. Google returns an ID token.
3. The client sends that token to:

```json
POST /api/sessions
{ "googleToken": "<google_id_token>" }
```

4. The backend returns the application's JWT.

For this to work in production:

- `VITE_GOOGLE_CLIENT_ID` must be set at build time
- the deployed frontend origin must be listed in Google OAuth Authorized JavaScript origins
- the backend `google.client-id` must accept the same client id

## Build Output

Create a production build with:

```bash
npm ci
npm run build
```

The compiled static site is written to:

```text
dist/
```

That folder is what you deploy to the web server or static hosting provider.

## Exact Deployment Instructions

### Recommended deployment model

Deploy the frontend as static files behind Nginx or another static web server.

### Vercel compatibility

Yes, this project can be deployed on Vercel.

The important requirements are:

- build command: `npm run build`
- output directory: `dist`
- production env vars: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`
- SPA fallback for `BrowserRouter`

This repository now includes [vercel.json](vercel.json) so deep links such as
`/home` and `/lesson/42` are rewritten to `index.html` on Vercel.

### Before building for production

1. Create `.env.production`:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
```

2. Make sure the backend is already reachable at `VITE_API_BASE_URL`.

3. Make sure the backend CORS configuration allows the frontend origin.

Important coordination note:

- The current backend CORS allowlist is defined in
  `server/src/main/java/com/tokenlearn/server/config/SecurityConfig.java`.
- If you deploy the frontend on a new production domain, backend CORS must be
  updated or browser requests will fail even if the API itself is up.

### Production build

Run:

```bash
npm ci
npm run build
```

### Copy the build to the server

Example target layout:

```text
/var/www/tokenlearn-client/
  index.html
  assets/
```

Copy the contents of `dist/` to that directory.

### Nginx configuration example

Use an SPA fallback so deep links such as `/home` or `/lesson/42` work after a
page refresh:

```nginx
server {
    listen 80;
    server_name app.example.com;

    root /var/www/tokenlearn-client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

If you terminate TLS with Nginx, use the usual `listen 443 ssl;` setup and keep
the same `try_files` rule.

### Deploy on Vercel

1. Import the `client` project into Vercel.
2. Set framework preset to `Vite` if Vercel does not detect it automatically.
3. Set build command:

```bash
npm run build
```

4. Set output directory:

```text
dist
```

5. Add production environment variables in the Vercel dashboard:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
```

6. Trigger a production deployment.

7. After deploy, test:

- root page load
- refresh on `/home`
- refresh on `/lesson/123`
- login
- Google sign-in
- authenticated API requests

### Verify the deployment

After the files are served:

1. Open the frontend root URL.
2. Refresh a deep route like `/home` or `/lesson/123`.
3. Confirm the browser still loads the SPA instead of returning `404`.
4. Open browser dev tools and confirm API requests target the production
   `VITE_API_BASE_URL`.
5. Test Google login from the deployed domain.

## Hosting Constraints

The current codebase has a few important deployment assumptions:

### 1. The app is served from `/`

`BrowserRouter` is mounted without a `basename`, so the current build expects
the app at the domain root.

If you want to serve it from a subpath like `/tokenlearn/`, you will need code
changes such as:

- Vite `base` configuration
- matching `BrowserRouter` basename

### 2. SPA rewrite support is mandatory

Because the app uses real client-side routes, the host must rewrite unknown
paths to `index.html`. That is already handled for Vercel by [vercel.json](vercel.json).

### 3. Environment variables are not runtime-configurable

This project currently does not load runtime config from a separate JS file.
Any change to API origin or Google client id requires a rebuild.

### 4. Backend CORS must match the frontend origin

The backend currently allows localhost and certain tunnel domains. A custom
production domain requires a backend CORS update.

## Production Checklist

- `.env.production` contains the correct `VITE_API_BASE_URL`
- `.env.production` contains the correct `VITE_GOOGLE_CLIENT_ID`
- backend is reachable over HTTPS
- backend CORS allows the deployed frontend origin
- Google OAuth Authorized JavaScript origins include the deployed frontend URL
- web server rewrites unknown routes to `index.html`
- frontend is served from `/`, not a subpath

## Troubleshooting

### Deep links return 404 after refresh

Your hosting platform is not rewriting SPA routes to `index.html`.
Add an SPA fallback such as:

```nginx
try_files $uri $uri/ /index.html;
```

### API calls fail in the browser but work with curl/Postman

Most likely a CORS mismatch. Update the backend CORS allowlist to include the
frontend origin.

### The app points to the wrong backend after deployment

`VITE_API_BASE_URL` is baked into the build. Rebuild the client with the correct
production environment file.

### Google login works locally but not in production

Check all of the following:

- `VITE_GOOGLE_CLIENT_ID` was present during the production build
- the deployed origin is in Google OAuth Authorized JavaScript origins
- the backend accepts the same Google client id
- the site is served over HTTPS if required by the browser/provider
