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
- Developer workbench with team spaces, recent conversations and a checklist based on your profile and availability.
- Patch and Pixel: optional SVG companions with contextual tips and a four-stop workspace tour. Choose a companion locally; the guide opens only when requested.
- Responsive navigation, keyboard page switching with Ctrl/Cmd+K, photo fallbacks and accessible guide/form dialogs.

## Interface

Deep navy surfaces, a soft blue accent and monospace metadata keep the interface familiar to developers. Code and issue tracking stay in GitHub; DevMesh focuses on the people and coordination between commits. Home and developer discovery are separate screens. The network starts with a readable card view, with the graph available as an alternate view.

Accounts with no connections or requests see normal empty states. The client supports the earlier API's explicit “No connections found” and “No pending connection requests found” 404 responses while servers update; unrelated 404 responses remain errors. Workspace failures identify the affected section and include optional request/status details, with a retry action. Unavailable services and malformed API responses leave other sections usable.

Pages load their JavaScript on demand while navigation remains available. Dashboard and collaboration sections render independently, and connections do not wait for project graph data. Chat opens the active conversation independently of the inbox and refreshes the inbox when its socket connects or reconnects. External web fonts enhance the page after initial rendering. For read-only public loading measurements, run `node scripts/measureLoading.mjs https://devmesh-ten.vercel.app/login`; see the backend [performance notes](https://github.com/codeWith-Ashwani/DevMesh/blob/main/PERFORMANCE.md) for inbox benchmarks and hosting limitations.

Live chat keeps one authenticated socket across workspace navigation, with the Socket.IO library downloaded after sign-in. New group invitations and membership updates hydrate authorized conversation metadata. The inbox and history catch up on reconnect. Empty chat screens explain how to start a conversation; failed data requests offer retry, and connection failures offer reconnect or sign-in. Offline events immediately disable sending while leaving controls and the current draft usable. Sign-out closes the session socket. Drafts stay in the current page during reconnect; they are not persisted across navigation or reload.

`node scripts/inspectChat.mjs` checks clicks on deployed desktop/mobile assets with mocked API responses and fake identities, without production writes. It verifies interface behavior, not live account authentication or message delivery; use the isolated browser scenarios for those workflows.

Project stages are labels. Only the team workspace shows completion percentages, calculated from real milestones. The home screen shows teams from the latest 50 projects and the latest three conversations in the loaded inbox. Use the project directory and inbox to load earlier records. Filtering applies to loaded records. Guide preferences use localStorage with a session fallback; there is no AI service or message collection behind the companions.

## Run locally

Use Node 22+. Run `npm ci`, copy `.env.example` to `.env`, set VITE*API_BASE_URL to your backend origin, and run `npm run dev`. Never place secrets in VITE* variables. Backend CLIENT_URL must match the frontend origin exactly.

`npm run build` produces dist/. Serve it with SPA fallback routing. The backend proxy must support WebSocket upgrades. See the backend deployment runbook for HTTPS, cookies, Redis and scaling requirements.

## Checks

- `npm run lint`
- `npm run build`
- `npm run test:e2e`

Browser tests expect the backend checkout beside this checkout at ../DevTinder, with its dependencies installed. They start an isolated ephemeral API on 7778 and Vite on localhost:5173. Install Chromium with `npx playwright install chromium`. On Windows with Edge installed, set PLAYWRIGHT_CHANNEL=msedge instead. The fixture uses fake accounts and never your live database. Stop existing services on those test ports first.

CI checks out both repositories, installs their dependencies and runs lint, build, dependency audit and browser tests. Keep frontend/backend releases compatible.

Browser checks cover personal/group live messaging, availability and milestones, desktop/sidebar layout, mobile overflow, companion preferences and tour navigation, focus containment/restoration, photo fallbacks and sign in. Screenshots are saved in test-results/ for visual review.

## Demo journey

Find your team → renew availability → explore matches → apply to a project role → accept a trial → form a team → open group chat → finish a milestone with evidence → publish the outcome.
