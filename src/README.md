# Source Map

This folder contains the TokenLearn React application source code.

## Main entry points

- `main.jsx`: mounts the SPA and enables browser routing
- `App.jsx`: defines providers and the route tree
- `context/AppContext.jsx`: global state, auth bootstrap, and API action layer
- `lib/apiClient.js`: backend transport and auth token handling
- `i18n/I18nContext.jsx`: language state and RTL/LTR switching
- `layouts/AppLayout.jsx`: authenticated shell and main navigation

## Folder guide

- `pages`: route-level screens
- `components`: shared UI pieces, route guards, and modal helpers
- `context`: the app-wide state container used by `useApp()`
- `lib`: infrastructure and domain helpers
- `i18n`: translations and language provider
- `layouts`: reusable page shells
- `assets`: bundled static assets imported by code

## Reading tip

If you are tracing a feature end-to-end, start from the page component, then
follow calls into `useApp()`, then into `lib/apiClient.js`, and finally into the
matching backend endpoint.
