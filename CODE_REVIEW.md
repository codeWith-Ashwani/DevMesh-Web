# DevMesh Web review — 6 October 2026

Reviewed route/shell rendering, authentication and account transitions, shared resource/chat caches, sockets, workbench loading, projects/applications, team workspace, collaboration/trials, profiles, directory/network graph, dialogs, keyboard/mobile navigation, build assets and dependency audits. Backend findings and reproducible chat benchmarks are in the companion DevMesh/CODE_REVIEW.md.

## Changes

- Each project workspace has its own component state. Navigating between project IDs resets forms and displayed data, and cancels obsolete workspace reads. Opening team chat and finding collaborators no longer trigger an unnecessary workspace refresh. Initial workspace failures offer a retry.
- Profile saves send explicit cleared values. Optional bio, links, age, gender, objective and avatar can be removed. Inputs have stable accessible names and the success toast uses the blue theme with timer cleanup.
- Authentication reads are cancelled when the user enters login or the shell unmounts, preventing an old request from restoring a previous session. All Axios requests default to a 15-second timeout; shared reads retain per-consumer cancellation.
- Validate shared collection responses before caching/rendering them. Misconfigured responses produce recoverable errors. Projects have an accessible retry action and do not present a failed empty request as a successful empty catalogue.
- Dialog focus initializes on mount and retains the latest close callback without reinitializing whenever its parent rerenders. Hidden/disabled controls are excluded from the focus trap.
- Network force calculations run in a small Web Worker. Deterministic initial positions render immediately and controls remain usable while the worker loads. ResizeObserver handles sidebar/container resizing; obsolete workers are terminated.
- Unexpected page rendering errors are contained inside the content area, preserving the navigation and offering recovery. Unknown links display a recovery page. Normal route navigation still keeps the document and socket alive.
- Project form length constraints match the backend/schema. New regression coverage verifies field clearing, same-component workspace navigation, modal focus, malformed collections, worker loading, unknown links and rendering recovery.

## Verification

- `npm run lint`, `npm run build`, `npm run test:e2e` with Microsoft Edge: 27 tests pass. The local API/database are disposable test fixtures.
- Existing end-to-end coverage includes two-browser personal/group delivery, retries without duplicate messages, live inbox updates, reconnect/navigation behavior, account isolation, denied chat history, availability, project creation/workspace actions, companion guide, keyboard access and mobile layouts.
- A held worker script verifies that a 150-peer graph renders and its zoom/navigation controls operate before force calculations are available. This is a responsiveness regression, not a large-network capacity certification.
- Production dependency audit: zero known vulnerabilities.
- Production build initial app JavaScript: 350.01 kB / 115.07 kB gzip. Graph worker: 1.20 kB. Route chunks remain split. Added recovery and validation have a small bundle cost.
- `node scripts/auditHosted.mjs` probes public API health/readiness and the real login page, then checks deployed assets across projects, collaboration, messages, feed, connections, requests and profile at widths 1280 and 390. It explicitly mocks authenticated API data; it does not test production account credentials or message delivery.
- Before deployment, those hosted rendering checks showed no JavaScript errors, bad assets, horizontal overflow or full-document navigation. Observed route interactions with mocked data were 70–195 ms desktop and 177–417 ms mobile. Network and cache conditions affect these measurements.

## Remaining operational verification

Production-account workflows and authenticated database/socket timings need a dedicated test account. Repository changes cannot alter Render/Atlas region placement or sleeping-service behavior. Existing graph/page caps and large SVG rendering remain future scalability considerations. Cache contents stay in memory and clear on account changes; authorization continues to be checked by the backend.
