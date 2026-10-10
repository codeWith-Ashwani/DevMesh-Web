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

Pages load their JavaScript on demand while navigation remains available. Dashboard and collaboration sections render independently, and connections do not wait for project graph data. Chat opens the active conversation independently of the inbox and refreshes the inbox when its socket connects or reconnects. External web fonts enhance the page after initial rendering. For read-only public loading measurements, run `node scripts/measureLoading.mjs https://devmesh-ten.vercel.app/login`. Inbox benchmark commands are available in the [backend README](https://github.com/codeWith-Ashwani/DevMesh#verification).

Live chat keeps one authenticated socket across workspace navigation, with the Socket.IO library downloaded after sign-in. The session retains its inbox and collaborators, plus drafts, pending sends and up to 300 recent messages in each of 20 recently opened conversations. These stay in memory and are cleared on sign-out or page reload. Opening a room still verifies its current access, and replay uses the last HTTP cursor to recover missed messages. Messages appear immediately as pending; the server acknowledgement confirms delivery, and failed sends retry with the same client ID. Incoming messages and group changes update the session even while another page is open. Duplicate read receipts are suppressed.

The chat interface includes conversation search, avatars, message previews, unread badges and a composer that fits the mobile viewport. Connection failures offer reconnect or sign-in, and offline events disable sending while leaving the controls usable.

Route navigation uses React Router transitions and preloads code on sidebar hover/focus/touch. A bounded, account-scoped memory cache reuses successful GET responses for 30 seconds and deduplicates concurrent requests. Previously loaded data renders immediately while an expired response refreshes. Successful mutations invalidate cached reads; authentication failures clear them, and explicit refresh controls bypass them. Sign-out also resets Redux lists. Cancelling a route's subscription does not cancel a shared read needed by another page. No private API data is prefetched or saved to localStorage.

`node scripts/inspectChat.mjs` checks clicks on deployed desktop/mobile assets with mocked API responses and fake identities, without production writes. It verifies interface behavior, not live account authentication or message delivery; use the isolated browser scenarios for those workflows.

Project stages are labels. Only the team workspace shows completion percentages, calculated from real milestones. The home screen shows teams from the latest 50 projects and the latest three conversations in the loaded inbox. Use the project directory and inbox to load earlier records. Filtering applies to loaded records. Guide preferences use localStorage with a session fallback; there is no AI service or message collection behind the companions.

## Run locally

Use Node 22+. Run `npm ci`, copy `.env.example` to `.env`, set VITE*API_BASE_URL to your backend origin, and run `npm run dev`. Never place secrets in VITE* variables. Backend CLIENT_URL must match the frontend origin exactly.

`npm run build` produces dist/. Serve it with SPA fallback routing. The backend proxy must support WebSocket upgrades. Production requires HTTPS and secure authentication cookies; configure REDIS_URL on the backend for shared live events and limits across multiple API instances.

## Checks

- `npm run lint`
- `npm run build`
- `npm run test:e2e`

Browser tests expect the backend checkout beside this checkout at ../DevTinder, with its dependencies installed. They start an isolated ephemeral API on 7778 and Vite on localhost:5173. Install Chromium with `npx playwright install chromium`. On Windows with Edge installed, set PLAYWRIGHT_CHANNEL=msedge instead. The fixture uses fake accounts and never your live database. Stop existing services on those test ports first.

CI checks out both repositories, installs their dependencies and runs lint, build, dependency audit and browser tests. Keep frontend/backend releases compatible.

Browser checks cover personal/group live messaging, availability and milestones, desktop/sidebar layout, mobile overflow, companion preferences and tour navigation, focus containment/restoration, photo fallbacks and sign in. Screenshots are saved in test-results/ for visual review.

## Demo journey

Find your team → renew availability → explore matches → apply to a project role → accept a trial → form a team → open group chat → finish a milestone with evidence → publish the outcome.
