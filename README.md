# Scenario 7 — Combined E-Learning Web Application

This project combines BOTH versions of Scenario 7 into one connected app:

- React Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, props and reusable components.
- Custom hooks: `useCourses()` and `useLearning()`.
- Context API: `LearningContext` and `AuthContext`.
- Routing: React Router, dynamic `/course/:id`, nested `/learning/*`, `useParams`, `useNavigate`, `Outlet`.
- Authentication: demo login, JWT token storage, protected frontend routes and protected backend APIs.
- API: Express REST endpoints, Axios, async/await, loading/error states, CRUD GET/POST/PATCH/PUT/DELETE, quiz and assignment submission, learning history.
- State: Zustand learning store with action logging middleware and browser storage persistence.
- Cache: small in-memory course API cache.
- JSON-file persistence for the demo backend.

## Requirements
Node.js 18+ recommended.

## Run
1. Extract the ZIP and open a terminal in `scenario7_elearning_combined`.
2. Run `npm install`.
3. Run `npm run start` to start both backend and frontend, OR use two terminals: `npm run server` and `npm run dev`.
4. Open the Vite URL printed in the terminal (normally http://localhost:5173).

Demo account: `student@example.com` / `student123`
Demo student ID: `STU1001`

The backend runs at `http://localhost:4000`. API base URL can be overridden with `VITE_API_URL`.

## Main routes
`/`, `/courses`, `/course/101`, `/learning`, `/learning/materials`, `/learning/progress`, `/learning/quiz`, `/learning/assignments`, `/learning/certificate`, `/quiz`, `/assignments`, `/certificate`, `/login`, `/profile`.

## API overview
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/courses`, `GET /api/courses/:id`, `GET /api/courses/:id/materials`
- `GET/POST /api/enrollments`, `PATCH/PUT/DELETE /api/enrollments/:id`
- `POST /api/quizzes`, `POST /api/assignments`, `GET /api/history`
- `GET /api/health`

JWT secret and demo credentials are for local coursework only; do not use this setup in production. The app deliberately keeps the syllabus demonstration easy to run without a database or external API.


## Added experiments: Testing, optimization and deployment

- Run component and interaction tests with `npm test` (Jest + React Testing Library).
- Route-level lazy loading/code splitting uses React `lazy` and `Suspense`.
- Basic PWA files: `public/manifest.webmanifest`, `public/sw.js`, and `public/icon.svg`.
- Deployment instructions and platform comparison: see `DEPLOYMENT_AND_TESTING.md`.
- Netlify configuration: `netlify.toml`; Vercel configuration: `vercel.json`; GitHub Pages workflow: `.github/workflows/pages.yml`.
- Build locally using `npm run build`; output is in `dist/`. Configure `VITE_API_URL` to point to a separately hosted API before deploying.
