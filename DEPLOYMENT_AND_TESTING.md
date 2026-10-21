# Scenario 7 — Experiments 5, 6 and 7

This document adds the testing, optimization/PWA/accessibility/security, and deployment experiments to the combined E-Learning project.

## Experiment 5 — Component testing (Jest + React Testing Library)

Install all packages with `npm install`, then run:

```bash
npm test
```

The test suite covers:
- Course card content and View Course interaction.
- Search and filtering by title, category, difficulty, duration and instructor.
- Accessible progress indicator, reusable Button and Input.
- Quiz validation, answer selection, score submission flow.
- Assignment minimum-length validation and successful submission flow.

To run Jest in watch mode: `npm run test:watch`.

## Experiment 6 — Performance, PWA, accessibility and security

- Route-level code splitting: page modules are loaded using `React.lazy()` and `Suspense`, including course details, quiz, assignment, profile and learning modules.
- PWA: `public/manifest.webmanifest`, `public/icon.svg` and `public/sw.js` provide install metadata and a basic same-origin app-shell/static-asset cache. A service worker is registered only in production.
- Loading: a visible fallback is shown while route chunks load. API calls already expose loading/error UI; course API responses use a small in-memory cache.
- Accessibility: semantic headings/forms, labels, keyboard-operable buttons and links, radio controls for quiz answers, focusable course search, visible progress text, and accessible form labels. Use Tab/Shift+Tab, Enter/Space and arrow keys in radio groups to verify keyboard access.
- Security: user text is rendered as React text (not `dangerouslySetInnerHTML`); validate and trim input before submission; protected backend endpoints validate JWTs; tokens are sent in the Authorization header. The demo's localStorage token is suitable only for coursework and is vulnerable to XSS if the app is compromised. Production apps should prefer secure, HttpOnly, SameSite cookies, HTTPS, server-side validation, rate limiting, strong secrets from environment variables, and security headers. Never place production secrets in `VITE_*` variables.
- Media/data optimization: no large video files are bundled; use hosted/streamed media, compressed WebP/AVIF images with dimensions and lazy loading, paginate larger catalogs, and request only fields needed by the view. The service worker caches same-origin static files; API responses are not cached offline by default.

## Experiment 7 — Production build and deployment

Create and inspect the production build:

```bash
npm run build
npm run preview
```

The frontend output is written to `dist/`. The Express API is a separate server and must be hosted separately for deployed enrollment, quiz, assignment and progress API calls. Set `VITE_API_URL` to the public API base URL (for example `https://your-api.example.com/api`) before building. Configure CORS on the API to allow the deployed frontend origin and use a production JWT secret. Do not use the demo credentials or secret for a real service.

### GitHub Pages

1. Push this project to a GitHub repository on the `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. The included `.github/workflows/pages.yml` builds and deploys `dist/` on pushes to `main`.
4. The Vite config detects GitHub Actions and sets the repository subpath as its base URL. The React router uses that base URL.
5. GitHub Pages only hosts static frontend files. Host the Express API separately and configure `VITE_API_URL` in the workflow/build environment if live API operations are required. For a repository site, ensure the deployed base path matches the repository name.

### Netlify

1. Import the repository in Netlify.
2. Build command: `npm run build`; publish directory: `dist`.
3. Set `VITE_API_URL` in Site configuration → Environment variables, then trigger a new deploy.
4. `netlify.toml` rewrites client-side routes to `index.html`.

### Vercel

1. Import the repository in Vercel.
2. Framework preset: Vite; build command: `npm run build`; output directory: `dist`.
3. Add `VITE_API_URL` to Project Settings → Environment Variables and redeploy.
4. `vercel.json` rewrites client-side routes to `index.html`.

### Compare deployment platforms

| Platform | Advantages | Considerations | Best fit |
|---|---|---|---|
| GitHub Pages | Free static hosting closely integrated with GitHub; included Actions workflow | Static frontend only; repository base paths and SPA route fallback need care; API must be hosted separately | Coursework/demo frontend and Git-based publishing |
| Netlify | Simple Git integration, previews, redirects and environment settings | Backend API still needs a host unless adapted to Netlify Functions | Quick student deployment with straightforward SPA rewrites |
| Vercel | Fast Git-based builds, preview deployments and SPA rewrites | Backend Express server in this project is not automatically deployed as a long-running service by the static frontend build | React frontend with separate API or a separately adapted serverless backend |

### Post-deployment test checklist

- [ ] Home and course catalog load on the deployed URL.
- [ ] Search and all filters work.
- [ ] Dynamic `/course/:id` links work, including page refreshes.
- [ ] Login, logout and protected route redirects work.
- [ ] Enrollment, progress, quiz, assignment and certificate requests reach the deployed API.
- [ ] API CORS allows only the intended frontend origin; no secrets are exposed in frontend assets.
- [ ] Browser DevTools → Network shows route chunks loading separately and no failed assets.
- [ ] Application manifest and service worker are available over HTTPS.
- [ ] Keyboard-only navigation and form labels are checked.

## Important notes

- `npm test` uses Jest and React Testing Library. If your college LMS needs screenshots, capture the passing test output and deployment pages from your own machine after installing dependencies.
- PWA offline support is intentionally basic: the app shell/static assets can be cached, but protected API-backed learning operations require network access.
- For production deployment, host the API separately and configure environment variables before creating the frontend build.
