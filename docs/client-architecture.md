# TokenLearn Client Architecture

## Overview

The client is a React 19 single-page application built with Vite.
It is responsible for:

- login, registration, Google sign-in, and logout
- authenticated navigation and route protection
- profile editing and personal area flows
- tutor discovery and lesson-request creation
- lesson lifecycle flows
- token balance and history views
- admin screens
- inbox notifications and lesson messages
- bilingual Hebrew/English UI with RTL support

The app is shipped as static files from `dist/` and talks directly to the
backend over HTTP(S).

## Runtime Model

### Boot sequence

1. `src/main.jsx` mounts the app with `BrowserRouter`.
2. `src/App.jsx` wraps the route tree with:
   - `I18nProvider`
   - `AppProvider`
   - `NotificationContainer`
3. `AppProvider` restores the stored auth token from `localStorage`.
4. If a token exists, the provider verifies it with the backend and loads
   `/api/users/me`.
5. Route guards wait for that bootstrap step before redirecting.

## Folder Map

| Folder | Responsibility |
| --- | --- |
| `src/pages` | Route-level screens such as login, home, calendar, admin, and lesson pages. |
| `src/components` | Reusable UI building blocks, guards, and modals. |
| `src/context` | Global application state and the main API/action surface exposed to components. |
| `src/lib` | API transport, Google Identity integration, formatting, validation, and message helpers. |
| `src/i18n` | Translation catalog, language provider, and RTL handling. |
| `src/layouts` | Shared layout shell for authenticated routes. |
| `public` | Static assets copied as-is by Vite. |
| `docs` | Project documentation and supporting materials. |

## Routing

The app uses `BrowserRouter`, so routes are real browser paths such as:

- `/login`
- `/register`
- `/forgot-password`
- `/home`
- `/find-tutor`
- `/lesson-requests`
- `/lesson/:id`
- `/me`
- `/rating`
- `/calendar`
- `/token-history`
- `/lesson-history`
- `/messages`
- `/admin`

This means the production web server must rewrite unknown paths back to
`index.html`, otherwise deep links will 404 on refresh.

## Global State And API Access

`src/context/AppContext.jsx` is the central orchestration layer.

It owns:

- authenticated user state
- JWT persistence in `localStorage`
- notification toasts
- unread notification count
- loading state derived from active API calls
- polling for inbox updates
- the public action API consumed by pages and components

Instead of each page talking to `fetch` directly, components call methods
provided by `useApp()`, for example:

- `login`
- `register`
- `googleLogin`
- `getCourses`
- `createLessonRequest`
- `getLessonDetails`
- `getNotifications`
- `getAdminUsers`

This keeps request wiring and error handling consistent across the app.

## API Layer

`src/lib/apiClient.js` is the only low-level transport module.

It is responsible for:

- reading `VITE_API_BASE_URL`
- attaching the Bearer token
- JSON vs `FormData` header handling
- decoding the backend's `{ success, data, error }` envelope
- normalizing auth payloads from login endpoints

Important deployment note:

- `VITE_API_BASE_URL` is a build-time Vite variable, not a runtime setting
- changing the API URL requires rebuilding the frontend bundle

## Authentication Flow

### Password login

1. User submits credentials on the login page.
2. `AppProvider.login()` calls `POST /api/auth/login`.
3. The returned JWT is stored under `authToken` in `localStorage`.
4. The provider immediately fetches `/api/users/me` to hydrate the full profile.

### Google login

`src/lib/googleIdentity.js` loads Google Identity Services dynamically and asks
for an ID token.

1. The client reads `VITE_GOOGLE_CLIENT_ID`.
2. Google returns an ID token.
3. The client sends it to `POST /api/auth/google`.
4. The backend returns the application JWT.

For production, the deployed frontend origin must be registered in Google OAuth
as an Authorized JavaScript origin, and the same client id must be configured on
the backend.

## Notifications

The client uses two notification layers:

- transient toast notifications in `NotificationContainer`
- durable inbox notifications fetched from the backend

`AppProvider` polls unread notifications every 30 seconds after authentication.
New unread inbox items are converted into short toast previews using
`src/lib/notificationInbox.js`.

## Internationalization

The app currently supports:

- Hebrew (`he`)
- English (`en`)

`I18nProvider`:

- stores the chosen language in `localStorage`
- sets `<html lang>`
- switches `<html dir>` between `rtl` and `ltr`
- exposes the `t()` translation helper

## Styling

There is no external component library. Styling is a mix of:

- shared global CSS in `src/index.css` and `src/App.css`
- inline style objects inside components and pages

This means most UI behavior is colocated with the component that owns it.

## Deployment Constraints

The current codebase assumes:

1. The app is served from the domain root `/`.
2. The hosting platform can rewrite SPA routes to `index.html`.
3. The backend is reachable at the built `VITE_API_BASE_URL`.
4. The backend CORS configuration allows the deployed frontend origin.

At the moment, the backend's CORS allowlist is limited in
`server/src/main/java/com/tokenlearn/server/config/SecurityConfig.java`.
If the frontend moves to a custom production domain, the backend CORS settings
must be updated or requests will fail in the browser.

## Good Entry Points For Reading The Code

Suggested reading order:

1. `src/main.jsx`
2. `src/App.jsx`
3. `src/context/AppContext.jsx`
4. `src/lib/apiClient.js`
5. `src/components/RouteGuards.jsx`
6. `src/lib/googleIdentity.js`
7. `src/i18n/I18nContext.jsx`
8. `src/layouts/AppLayout.jsx`
