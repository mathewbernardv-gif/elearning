# Experiment 4: JWT Login Troubleshooting

## Run locally
1. Extract this ZIP and open a terminal in this folder (the folder containing `package.json`).
2. Run `npm install`.
3. Run `npm run start` and keep the terminal open.
4. Confirm `http://localhost:4000/api/health` returns JSON with `"status":"ok"`.
5. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## Demo credentials
- Email: `student@example.com`
- Password: `student123`

## What was fixed
- AuthContext validates the login response before saving a token.
- Failed login clears stale local credentials.
- Authentication state requires both a saved user and a token.
- React Router future flags silence the two v6-to-v7 migration warnings when supported by the installed React Router version.

## If login still fails
Open DevTools > Network, select `auth/login`, and inspect its status and response. `ERR_CONNECTION_REFUSED` means the backend is not reachable; `401` means credentials were rejected; `404` usually means the API URL/path is wrong. Check the backend terminal for errors.

The token is a demo JWT; this project is for coursework, not production authentication.
