# Navigation and chat responsiveness

The previous chat route keyed its entire session by conversation and initialized inbox, collaborators, history and drafts from scratch on every visit. Workspace pages similarly discarded their loaded data. Client-side links already used React Router; a new document reload was not reproduced. These changes address repeated data loading and the resulting page flash.

## Changes

- React Router transitions preserve revealed content during lazy module loading. Sidebar navigation intent preloads route code, without issuing private API requests.
- General page GET reads are shared and cached in memory for 30 seconds, with a maximum of 100 responses. Each response belongs to the current authenticated account. Mutations invalidate the cache; 401/403 responses and account changes clear it. Previously loaded data remains visible while expired data refreshes.
- Individual route cancellation stops that consumer's updates while a shared request can finish for another consumer. In-flight reads from an earlier account/cache generation cannot repopulate the cache.
- Chat maintains one session socket, its inbox, collaborator list and 20 recent room snapshots (up to 300 messages per room). Drafts and pending sends survive navigation. All of this is memory-only and ends on sign-out or document reload.
- Room access and history are still fetched through authenticated server endpoints. The replay cursor advances from HTTP synchronization, never from a live event, so newer events cannot hide an intervening gap. Cached history does not authorize sending; the backend checks current access for every event. Access failures remove the cached room.
- Optimistic sends display a pending bubble immediately and clear the composer. Acknowledgement confirms persistence; rejection/timeout offers retry using the same client ID. New drafts remain intact during a retry. Late acknowledgements update the originating room even after navigation. Live events and acknowledgements merge by server message ID.
- Conversation previews, search, unread badges, blue navigation highlights and structured loading placeholders improve orientation. The mobile composer stays inside the viewport. Read receipts are sent once per observed message watermark rather than on every state update.

## Validation

`npm run test:e2e` uses an isolated ephemeral backend/database and fake accounts. Navigation regression checks traverse two rooms, Projects, and Messages using links, verify each room's draft, and record document requests, Socket.IO connections, inbox reads, collaborator reads and project reads. The document and socket counts must remain one; cached route revisits must not add inbox/collaborator requests, and the project directory must load once. Counts are attached to the test result as JSON.

Other checks hold a Socket.IO acknowledgement to verify immediate pending feedback, navigate away and return before a failed acknowledgement, retry and assert exactly one persisted message. They verify incoming messages while browsing another page, cache/draft isolation after signing in as another user, and switching away from a slow read that the destination also needs. Existing coverage verifies reconnect, group invitations, live personal/group delivery, milestones, mobile overflow, accessibility and partial API failures.

These checks establish client behavior and request counts in a local test environment, not authenticated production latency or a load-test result. No production accounts or database writes are used. The frontend cannot eliminate Render cold starts or the reported distance between the backend region and Atlas Mumbai. Measure authenticated request waiting time and database latency in the deployed environment before changing hosting configuration; see the backend performance runbook.

Implementation references: [React Router transitions](https://reactrouter.com/explanation/react-transitions), [React Suspense and transitions](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding).
