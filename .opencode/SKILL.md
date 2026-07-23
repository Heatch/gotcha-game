# gotcha! — Project Skill

## Overview
Mobile-first web app for the "gotcha!" party game (inspired by "Don't Get Got"). Players log in, select 5 secret missions, then complete them during gameplay.

## Tech Stack
- **Frontend:** React 18 + TypeScript, Vite 5, react-router-dom v6, framer-motion
- **Backend:** Node.js + Express (port 3001), Socket.IO
- **Styling:** Plain CSS with CSS custom properties for theming, Nunito (Google Fonts)

## Project Structure
```
gotcha/
├── schemas/                        # JSON Schema files (committed to repo)
│   ├── users.schema.json           # Validates user objects
│   └── missions.schema.json        # Validates mission objects
├── client/                         # React + Vite (dev server port 5173, proxied to 3001)
│   └── src/
│       ├── api.ts                  # All fetch calls to Express backend
│       ├── App.tsx                 # Routes: /, /missions, /wallet
│       ├── App.css                 # All styles + theme variables
│       ├── main.tsx                # Entry point (BrowserRouter, providers)
│       ├── hooks/
│       │   └── useSocket.ts        # Socket.IO connection, message state, sendMessage
│       ├── components/
│       │   ├── LoginForm.tsx       # Name + password form, error/loading states
│       │   ├── MissionCard.tsx     # Selectable mission card (selection flow)
│       │   ├── MissionSelector.tsx # 2-card OR layout, fade+slide transitions
│       │   ├── MissionWalletCard.tsx # Wallet card: pencil, FAIL/SUCCESS, carousel, comments
│       │   ├── NameCarousel.tsx    # Horizontal chips of player names + "Group"
│       │   ├── ProgressBar.tsx     # 5-dot selection progress
│       │   ├── ThemeToggle.tsx     # Light/dark mode toggle
│       │   ├── ChatPanel.tsx       # Slide-in drawer, Socket.IO chat
│       │   └── LeaderboardPanel.tsx # Overlay with sorted pseudonyms
│       ├── context/
│       │   ├── AuthContext.tsx      # User state, login/logout, sessionStorage
│       │   └── ThemeContext.tsx     # light/dark, localStorage + prefers-color-scheme
│       └── pages/
│           ├── LoginPage.tsx
│           ├── MissionSelectPage.tsx
│           └── WalletPage.tsx       # Mission wallet: cards, score, chat, leaderboard
├── server/
│   ├── data/
│   │   ├── users.json              # REAL DATA — gitignored
│   │   ├── missions.json           # REAL DATA — gitignored
│   │   ├── users.example.json      # Sample data for repo
│   │   └── missions.example.json   # Sample data for repo
│   ├── routes/
│   │   ├── auth.js                 # POST /api/login
│   │   ├── missions.js             # GET pool, POST select, POST status
│   │   └── users.js                # GET /api/users/names
│   └── server.js                   # Express + Socket.IO
├── .opencode/
│   ├── SKILL.md                    # This file
│   └── conventions.md              # Coding conventions
└── .gitignore
```

## Data Schemas

### users.json
```jsonc
{
  "name": "Hitesh",
  "password": "mango",
  "pseudonym": "SharpGecko55",       // generated once, immutable, format: [Desc][Animal]##
  "missions": [
    {
      "mission": "Get someone to dab",
      "status": "open",              // "open" | "failed" | "completed"
      "last_edit": "",
      "gotted": "",
      "comments": ""                 // optional comment on how they got them
    }
  ],
  "selection_complete": false,
  "selection_pool": [],
  "score": 0,                        // sum of completed missions
  "asks": 0,
  "gotted_history": []               // names gotted; auto-clears when all others gotted once
}
```

### missions.json
```jsonc
{ "id": 1, "mission": "Get someone to dab", "state": "inactive" }
```
- **state values:** `"inactive"` (available) → `"active"` (claimed, never reused)
- Each mission can be claimed by only one player

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/login` | Authenticate user, return user object (no password) |
| GET | `/api/missions/pool?name=X` | Get/resume mission selection pool |
| POST | `/api/missions/select` | Claim a mission, get next pool |
| POST | `/api/missions/status` | Update mission (failed/completed), gotted, comments. Broadcasts chat. |
| GET | `/api/users/names` | Returns all names + pseudonyms + scores |
| Socket.IO | `chat_message` (send) | Client sends chat message |
| Socket.IO | `chat_history` (receive) | Server sends message history on connect |
| Socket.IO | `chat_message` (receive) | Server broadcasts new message to all clients |

## Real-Time Chat (Socket.IO)
- Messages stored in-memory (capped at 200, lost on server restart)
- Three message types: `system` (success, green), `system_fail` (failure, red), `user` (chat, accent-colored)
- System messages include optional comment field shown in italic below
- Server auto-broadcasts system messages when mission status is updated via `POST /api/missions/status`

## Mission Wallet Interactions

### FAIL flow (2-step, locks after confirm)
1. Tap pencil → card expands: `[FAIL]` `[SUCCESS]`
2. Tap FAIL → confirmation: "Mark as failed?" → `[Yes, fail it]` `[Cancel]`
3. Yes → card turns red, locks permanently (pencil hidden), chat posted: "Name failed mission: ..."

### SUCCESS flow (multi-step, backable until submit)
1. Tap pencil → `[FAIL]` `[SUCCESS]`
2. Tap SUCCESS → NameCarousel (← back to step 1)
3. Tap name/Group → comment textarea (← back to step 2)
4. Submit → card turns green, locks, score +1, chat posted: "Name completed mission: ..."
5. "Group" always selectable, never added to gotted_history

### Gotted history rule
- Cannot select same player twice
- Auto-clears when ALL other players have been gotted once
- "Group" never tracked

## Key Patterns

### Adding a New Page
1. Create `client/src/pages/YourPage.tsx` (wrap in `<div className="page">`)
2. Add route in `App.tsx` (use `<ProtectedRoute>` if behind auth)
3. Add styles to `App.css` using CSS custom properties from theme

### Adding a New API Endpoint
1. Create route file in `server/routes/`
2. Use `req.app.locals.readJSON()` / `writeJSON()` for data access
3. Mount in `server.js`

### Adding a Socket.IO Event
1. Add listener in `server.js` `io.on('connection', ...)` block
2. Consume in client via the `useSocket()` hook or direct `socket.emit()`

### State Management
- **Auth:** `AuthContext` (React context) — persisted to `sessionStorage`
- **Theme:** `ThemeContext` (React context) — persisted to `localStorage`
- **Chat:** `useSocket()` hook manages messages + connection state
- API calls are plain `fetch()` in `api.ts`, results update context via `setUser()`
- UI panels (chat, leaderboard) use local `useState` in `WalletPage`, passed as `open`/`onClose` props

### Theming
- Use `var(--token-name)` in CSS — never hardcode colors
- Available tokens: `--bg`, `--bg-card`, `--text`, `--text-secondary`, `--accent`, `--accent-hover`, `--error`, `--border`, `--shadow`, `--shadow-hover`, `--input-bg`
- `data-theme="light"` and `data-theme="dark"` are set on `<html>`

## Running the App
```bash
# Terminal 1 — Server
cd server && node server.js

# Terminal 2 — Client
cd client && npm run dev
```

## Future Development Areas
- **Live game state:** Track which players have completed which missions in real-time
- **Mission verification:** Photo/vote-based proof of completion
- **"Got" calls:** `asks` counter mechanic
- **Game timer/end conditions:** Auto-end game when all missions resolved
- **Persistent chat:** Store messages to a file for replay across restarts
