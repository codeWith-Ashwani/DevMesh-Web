# DevMesh Web

DevMesh Web is a high-performance developer networking and project collaboration platform. It enables engineers to showcase verified technical stacks, discover peer developers through multi-dimensional filtering, visualize interactive network topology and skill clusters, coordinate collaboration on engineering initiatives, and communicate via direct peer-to-peer messaging.

The frontend is built as a single-page application (SPA) with React 19, Vite, and Tailwind CSS, leveraging Redux Toolkit for centralized state management and communicating with a decoupled Node.js/Express backend.

---

## ✨ Features

- **Developer Intelligence & Discovery Feed**
  - Paginated developer feed with batch loading (`/feed?page=X&limit=50`).
  - Multi-dimensional client-side filtering by technical skills (React, Node.js, TypeScript, Python, Go, Rust, AWS, etc.) and collaboration goals (*Project collaborators, Mentorship, Open-source contributors, Job opportunities, Study partners, Freelance work*).
  - Real-time search across developer names, bios, and skill sets.
  - Interactive profile spotlight with quick *Connect* (`interested`) and *Pass* (`ignore`) actions.
  - Live developer ecosystem telemetry aggregating skill distribution percentages and connection ratios across discoverable developers.

- **Interactive Network Mesh & Skill Graph**
  - Custom SVG-rendered interactive force-directed graph with spring-relaxation physics simulation.
  - Multi-entity relationship mapping across **Developers** (nodes with avatars), **Skills** (diamond code tags), and **Projects** (stage-coded initiative boxes).
  - Canvas viewport navigation: drag-to-pan, zoom in/out, mouse wheel zoom, and view reset.
  - Node inspection panel displaying contextual metadata, linked skill clusters, associated peers, and external profiles.
  - Dual view modes: Interactive Graph Canvas and Matrix Directory Grid view.

- **Collaboration Projects & Initiatives Registry**
  - Project directory with milestone progress indicators categorized by build stage (*Idea*, *Building*, *Launched*).
  - Initiative publisher allowing developers to specify technical specs, required tech stacks, roles sought, build stages, time commitments, and repository links.
  - Project application system with custom technical domain application proposals.
  - Project lead management dashboard to review applicants and accept or decline candidates.

- **Direct Peer Messaging (Chat)**
  - Dedicated 1-on-1 direct messaging interface with connected peers.
  - Real-time polling synchronization (3-second intervals) with automatic bottom scrolling.
  - Message history tracking with ISO timestamp formatting and status indicators.

- **Connection Requests Management**
  - Review incoming peer connection requests with full developer bio and skill tags.
  - One-click *Accept* or *Decline* request processing with automatic state updates.
  - Real-time notification badges displayed across the navigation bar and sidebar.

- **Developer Identity & Live Preview Profile Editor**
  - Profile configuration for bio, skill tags, collaboration objective, age, gender, avatar URL, and external links (GitHub, LinkedIn, Portfolio).
  - Side-by-side live profile card preview synchronized with input changes.
  - Transient toast feedback upon successful updates.

- **Global Command Palette (`Ctrl + K` / `Cmd + K`)**
  - Keyboard-driven universal navigation modal for quick jumps across workspaces.
  - Full keyboard navigation support (arrow keys, Enter to execute, Escape to dismiss).

---

## 🏗️ Architecture

DevMesh Web functions as a decoupled client layer in a client-server architecture, communicating with the DevMesh REST API via HTTP-only cookie-authenticated sessions.

```
┌──────────────────────────────────────────────────────────┐
│                   DevMesh Web (Client)                   │
│                                                          │
│  React 19 (SPA)  ◄──►  Redux Toolkit Store               │
│       │               (user, feed, connections, requests)│
│       ▼                                                  │
│  React Router DOM v7 (Layouts, Guards, Dynamic Routes)   │
│       │                                                  │
│       ▼                                                  │
│  Axios HTTP Client (withCredentials: true)               │
└────────────────────────────┬─────────────────────────────┘
                             │
                  HTTP / JSON (REST APIs)
                  Cookie-based JWT Session
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              DevMesh Backend (Node / Express)            │
│  https://github.com/codeWith-Ashwani/DevMesh             │
│                                                          │
│  Authentication Middleware & Route Controllers           │
│  (Auth, Profile, Requests, Users/Feed, Chat, Projects)   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│     Collections: Users, ConnectionRequests,              │
│                  Messages, Projects                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component-based UI architecture utilizing modern hooks (`useCallback`, `useMemo`, `useRef`, `useState`, `useEffect`) |
| **Vite 7** | Next-generation frontend build tooling and local development server with Fast Refresh |
| **Redux Toolkit (RTK)** | Centralized, predictable application state management for authentication, feed, peer connections, and requests |
| **React Redux** | Official React bindings for Redux state subscription and dispatching |
| **React Router DOM v7** | Declarative client-side routing, nested layout architecture, and URL parameter handling |
| **Tailwind CSS v4** | Utility-first CSS engine powering design tokens, custom dark theme palettes, and responsive layouts |
| **@tailwindcss/vite** | Official Vite plugin for Tailwind CSS integration |
| **DaisyUI** | Semantic component utility classes complementing the custom design system |
| **Axios** | Promise-based HTTP client configured with credential forwarding for secure API requests |
| **ESLint 9** | Code quality enforcement, static analysis, and React Hooks linting rules |

---

## 📂 Project Structure

```
devTinderWeb/
├── public/                 # Static public assets (Vite icon, etc.)
├── src/
│   ├── components/         # Page views and modular UI components
│   │   ├── network/        # Interactive mesh graph topology components
│   │   │   ├── NetworkDetailsPanel.jsx  # Side inspector panel for graph nodes
│   │   │   ├── NetworkFilters.jsx       # Graph filter bar & view mode switcher
│   │   │   ├── NetworkGraph.jsx         # Custom SVG force-directed simulation canvas
│   │   │   └── NetworkNode.jsx          # SVG node renderers (developer, skill, project)
│   │   ├── ui/             # Reusable design system primitives and icons
│   │   │   ├── CommandPalette.jsx       # Global keyboard navigation modal (Ctrl+K)
│   │   │   └── Icons.jsx                # Custom SVG icon set
│   │   ├── Body.jsx        # Root application frame, layout shell & auth lifecycle
│   │   ├── Chat.jsx        # 1-on-1 peer messaging interface & thread polling
│   │   ├── Connections.jsx # Network page container (Graph & Directory views)
│   │   ├── EditProfile.jsx # Profile configuration form with real-time preview
│   │   ├── Feed.jsx        # Developer discovery dashboard & telemetry feed
│   │   ├── Footer.jsx      # Global footer with telemetry status
│   │   ├── Login.jsx       # Authentication portal (Sign In & Sign Up tabs)
│   │   ├── Navbar.jsx      # Top navigation header & user profile dropdown
│   │   ├── Profile.jsx     # Profile view wrapper
│   │   ├── Projects.jsx    # Engineering projects registry & application manager
│   │   ├── Requests.jsx    # Incoming peer connection requests manager
│   │   ├── Sidebar.jsx     # Responsive collapsible navigation sidebar
│   │   └── UserCard.jsx    # Developer spotlight & feed card component
│   ├── utils/              # State store, Redux slices & configuration
│   │   ├── appStore.js         # Central Redux store configuration
│   │   ├── connectionsSlice.js # Slice for connected developer peers
│   │   ├── constants.js        # API base URL configuration (/api)
│   │   ├── feedSlice.js        # Feed data, pagination append & removal
│   │   ├── requestsSlice.js    # Incoming request tracking slice
│   │   └── userSlice.js        # Authenticated user profile slice
│   ├── App.jsx             # Main router configuration & Redux Provider
│   ├── index.css           # Global CSS, theme color variables, fonts & custom scrollbars
│   └── main.jsx            # React root application entry point
├── eslint.config.js        # ESLint flat configuration
├── index.html              # HTML shell entry point
├── package.json            # Project dependencies & scripts
└── vite.config.js          # Vite configuration with Tailwind plugin & dev proxy
```

---

## 🔐 Authentication

Authentication is handled via secure, HTTP-only cookies issued by the backend upon login or registration:

1. **Authentication Portal (`/login`)**:
   - Handles both **Sign In** (`POST /api/login`) and **Sign Up** (`POST /api/signup`).
   - On success, the returned user object is dispatched to `userSlice` and the client redirects to `/` or `/profile`.
2. **Session Verification & Hydration**:
   - On initial application load, `Body.jsx` issues a verification request to `GET /api/profile/view` with `{ withCredentials: true }`.
   - If authenticated, user profile data is loaded into the Redux store.
   - If unauthenticated (HTTP `401`), the client automatically redirects to `/login`.
3. **Session Termination**:
   - `Navbar.jsx` and `Sidebar.jsx` trigger `POST /api/logout`.
   - On logout, `removeUser()` clears the Redux session state and routes the user to `/login`.

---

## 🔄 State Management

Application state is centrally managed with **Redux Toolkit (`@reduxjs/toolkit`)**:

```
appStore
├── userSlice         # Current authenticated user object (null when unauthenticated)
├── feedSlice         # Discoverable developer pool, pagination append, and card dismissal
├── connectionsSlice  # Established peer connections list
└── requestsSlice     # Pending incoming connection requests with badge counters
```

### Key Reducer Actions:
- **`userSlice`**: `addUser` (hydrates user profile), `removeUser` (clears user on logout).
- **`feedSlice`**: `addFeed` (replaces feed pool), `appendFeed` (concatenates paginated records with deduplication), `removeUserFeed` (removes developer after connection request).
- **`connectionsSlice`**: `addConnections`, `removeConnections`.
- **`requestsSlice`**: `addRequests`, `removeRequests` (removes reviewed request and updates badge).

---

## 🌐 API Integration

All network communication is handled through **Axios**. In development, Vite is configured with a reverse proxy to eliminate CORS overhead and match production-like routing:

### Vite Proxy Configuration (`vite.config.js`)
```javascript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:7777",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
}
```

### Core API Endpoints Consumed:

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/signup` | Register a new developer account |
| **Auth** | `POST` | `/api/login` | Authenticate with email & password |
| **Auth** | `POST` | `/api/logout` | Terminate session cookie |
| **Profile** | `GET` | `/api/profile/view` | Fetch current authenticated user profile |
| **Profile** | `PATCH` | `/api/profile/edit` | Update developer profile, skills, and links |
| **Feed** | `GET` | `/api/feed?page=1&limit=50` | Retrieve paginated discoverable developers |
| **Requests**| `POST` | `/api/request/send/:status/:userId` | Send connection request (`interested` / `ignore`) |
| **Requests**| `GET` | `/api/user/requests/received` | Fetch pending incoming connection requests |
| **Requests**| `POST` | `/api/request/review/:status/:requestId` | Review request (`accepted` / `rejected`) |
| **Network** | `GET` | `/api/user/connections` | Fetch established peer connections |
| **Projects**| `GET` | `/api/projects` | Fetch all engineering collaboration projects |
| **Projects**| `POST` | `/api/projects` | Publish a new engineering initiative |
| **Projects**| `POST` | `/api/projects/:id/apply` | Submit application proposal to a project |
| **Projects**| `GET` | `/api/projects/:id/applications` | Fetch applicant list for an owned project |
| **Projects**| `PATCH`| `/api/projects/:id/applications/:appId` | Update application status (`accepted` / `rejected`) |
| **Chat** | `GET` | `/api/chat/:targetUserId` | Retrieve conversation history with peer |
| **Chat** | `POST` | `/api/chat/:targetUserId` | Send direct message to peer |

---

## 🎨 UI / UX Design System

- **Dark-Theme Palette**: Engineered with custom deep navy and slate surface colors (`#080A14`, `#0D1020`, `#11152A`, `#1E2442`) paired with blue (`#3B82F6`) and cyan (`#06B6D4`) accent highlights.
- **Visual Depth**: Utilizes ambient radial gradients, subtle grid patterns, and glassmorphic translucent backdrops (`backdrop-blur-xl`).
- **Responsive Layout**: Collapsible desktop sidebar with mobile slide-out navigation drawer.
- **Typography & Status**: Standard interface sans-serif with `JetBrains Mono` monospace accents for technical metadata, status indicators, and keyboard shortcut chips.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **DevMesh Backend**: Running locally on port `7777` (or configured remote instance)

### 1. Clone the Repository
```bash
git clone https://github.com/codeWith-Ashwani/DevMesh-Web.git
cd DevMesh-Web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`. Requests made to `/api/*` will automatically proxy to `http://localhost:7777`.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles production assets into the `dist/` directory |
| `npm run preview` | Locally serves the production build output for verification |
| `npm run lint` | Runs ESLint across all `.js` and `.jsx` files |

---

## 🧪 Code Quality & Tooling

- **Linter**: ESLint 9 using flat config (`eslint.config.js`) configured with `@eslint/js`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- **Bundle Optimization**: Built with Vite 7 and Rollup for tree-shaking and asset minification.

---

## 📸 Screenshots

<!-- Replace these placeholder references with actual screenshots -->
<div align="center">

| Dashboard & Telemetry Feed | Interactive Network Topology |
| :---: | :---: |
| ![Dashboard Placeholder](https://placehold.co/600x360/0D1020/3B82F6?text=Dashboard+%26+Telemetry+Feed) | ![Graph Placeholder](https://placehold.co/600x360/0D1020/3B82F6?text=Interactive+Network+Mesh+Graph) |

| Collaboration Projects Registry | Direct Peer Messaging |
| :---: | :---: |
| ![Projects Placeholder](https://placehold.co/600x360/0D1020/3B82F6?text=Collaboration+Projects+Registry) | ![Chat Placeholder](https://placehold.co/600x360/0D1020/3B82F6?text=Direct+Peer+Messaging) |

</div>

---

## 🔗 Backend Repository

The backend API server for DevMesh is maintained in a separate repository:

👉 **[DevMesh Backend Repository](https://github.com/codeWith-Ashwani/DevMesh)**

The backend is built with Node.js, Express, MongoDB, Mongoose, and JSON Web Tokens (JWT), providing endpoints for authentication, profile management, connection requests, project collaboration, and chat streams.

---

## 🎯 Engineering Highlights

1. **Custom Force-Directed Graph Engine**
   Implemented an iterative spring-relaxation physics simulation in React (`useMemo`) to render dynamic multi-type topologies without relying on heavyweight external D3 graph dependencies. Handles multi-type relationships (`dev-dev`, `dev-skill`, `dev-proj`, `proj-skill`) with real-time node highlighting and connected edge emphasis.

2. **Centralized Reactive State Architecture**
   Orchestrated Redux Toolkit slices (`user`, `feed`, `connections`, `requests`) ensuring immediate UI synchronization across navigation badge counters, dynamic feed pagination, and connection status changes.

3. **Secure Cookie-Based Session Pipeline**
   Configured automated credential forwarding (`withCredentials: true`) with root-level session hydration and seamless 401 interception routing in `Body.jsx`.

4. **Multi-Dimensional Client-Side Query Engine**
   Combined text search queries, multi-select skill tags, and collaboration objective filters into memoized selectors (`useMemo`) to provide instant sub-millisecond filtering across loaded developer feeds.

5. **Keyboard-First Global Command Palette**
   Engineered a global `Ctrl+K` command palette with window event listeners, arrow key navigation, category grouping, and instant routing for high-efficiency navigation.

---

## 🔮 Future Improvements

- **WebSocket Integration**: Upgrade peer-to-peer messaging from interval polling to bidirectional WebSockets / Socket.io for instantaneous message delivery and typing indicators.
- **Optimistic UI Updates**: Introduce optimistic state updates for connection requests, project applications, and candidate review decisions.
- **Advanced Graph Interactions**: Add node pinning, custom clustering controls, and force configuration sliders to the network canvas.
- **Automated Testing Suite**: Introduce Vitest and React Testing Library for component unit tests and Playwright for end-to-end user flow testing.

---

## 👨‍💻 Author

**Ashwani Singh**
- GitHub: [@codeWith-Ashwani](https://github.com/codeWith-Ashwani)
- Frontend Repository: [DevMesh-Web](https://github.com/codeWith-Ashwani/DevMesh-Web)
- Backend Repository: [DevMesh](https://github.com/codeWith-Ashwani/DevMesh)
