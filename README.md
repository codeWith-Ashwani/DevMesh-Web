# DevMesh Web

Find compatible collaborators, try a small milestone, form a team and ship a project together. This React client connects to the [DevMesh backend](https://github.com/codeWith-Ashwani/DevMesh).

## Features

- Profiles, developer discovery, network graph and connection requests.
- Role-based projects with seat counts, scoped deliverables and application review.
- Availability renewal and explained project matches.
- Trial invitations, decisions and trial conversations.
- Team milestones with evidence, check-ins, collaborator suggestions and published outcomes.
- Live personal and group chat using Socket.IO: typing, receipts, history pagination, reconnect synchronization and retry-safe sends.
- Group owners manage membership; accepted project teams get their own channel.

## Run locally

Use Node 22+. Run `npm ci`, copy `.env.example` to `.env`, set VITE_API_BASE_URL to your backend origin, and run `npm run dev`. Never place secrets in VITE_ variables. Backend CLIENT_URL must match the frontend origin exactly.

`npm run build` produces dist/. Serve it with SPA fallback routing. The backend proxy must support WebSocket upgrades. See the backend deployment runbook for HTTPS, cookies, Redis and scaling requirements.

## Checks

- `npm run lint`
- `npm run build`
- `npm run test:e2e`

Browser tests expect the backend checkout beside this checkout at ../DevTinder, with its dependencies installed. They start an isolated ephemeral API on 7778 and Vite on localhost:5173. Install Chromium with `npx playwright install chromium`. On Windows with Edge installed, set PLAYWRIGHT_CHANNEL=msedge instead. The fixture uses fake accounts and never your live database. Stop existing services on those test ports first.

CI checks out both repositories, installs their dependencies and runs lint, build, dependency audit and browser tests. Keep frontend/backend releases compatible.

## Demo journey

Find your team → renew availability → explore matches → apply to a project role → accept a trial → form a team → open group chat → finish a milestone with evidence → publish the outcome.
