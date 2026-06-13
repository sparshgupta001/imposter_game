# Imposter Game

A real-time multiplayer social deduction game built with React, Express, and Socket.io. One player is secretly the imposter, everyone else knows the topic, and the group must use clues, live discussion chat, and voting to uncover the imposter before the round ends.

## Features

* Real-time multiplayer rooms powered by Socket.io
* 4-letter shareable room codes
* Host-controlled game flow and category selection
* Private role reveal for each player
* Random imposter assignment performed server-side
* One-word clue phase with server-authoritative timers
* Real-time discussion phase with live in-game chat
* 30-second discussion timer
* Voting system with locked-in votes
* Animated vote reveal and imposter reveal
* Multi-round scoring system
* Final leaderboard after all rounds
* Reconnection support for temporary network drops
* Mobile-first responsive design
* Modern light-theme UI
* Polling-first Socket.io transport for improved mobile compatibility
* Retry connection flow for unstable networks
* Host reassignment when hosts leave rooms
* Automatic player cleanup and room lifecycle management
* Toast notifications for important game events

## 🔴 Live Demo

👉 [Play Now](https://imposter-game-ten-xi.vercel.app)

## Tech Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* Socket.io Client
* Canvas Confetti

### Backend

* Node.js
* Express
* Socket.io

### Deployment

* Vercel (Frontend)
* Railway (Backend)

### State Management

* React Context API
* In-memory room and game state on the server

## Installation

### Clone Repository

```bash
git clone https://github.com/sparshgupta001/imposter_game.git
cd imposter_game
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Install Frontend Dependencies

```bash
cd ../client
npm install
```

## Environment Variables

### Server

Create a `.env` file inside the `server` directory if required.

| Variable      | Default | Description                                                         |
| ------------- | ------- | ------------------------------------------------------------------- |
| PORT          | 3001    | Express and Socket.io server port                                   |
| CLIENT_ORIGIN | *       | Allowed frontend origin for CORS. Use your Vercel URL in production |

Example:

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

### Client

Create a `.env.local` file inside the `client` directory.

| Variable        | Default               | Description                  |
| --------------- | --------------------- | ---------------------------- |
| VITE_SERVER_URL | http://localhost:3001 | Backend Socket.io server URL |

Example:

```env
VITE_SERVER_URL=http://localhost:3001
```

Production example:

```env
VITE_SERVER_URL=https://your-app.up.railway.app
```

## Running Locally

### Start Backend

```bash
cd server
npm run dev
```

Backend runs on:

```text
http://localhost:3001
```

### Start Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

### Mobile Testing

To test from phones connected to the same network:

```bash
npm run dev -- --host 0.0.0.0
```

Find your computer IP:

```bash
ipconfig
```

Set:

```env
VITE_SERVER_URL=http://YOUR_LOCAL_IP:3001
```

Example:

```env
VITE_SERVER_URL=http://192.168.1.5:3001
```

## Production Build

### Build Frontend

```bash
cd client
npm run build
```

### Preview Frontend Build

```bash
npm run preview
```

### Start Backend

```bash
cd server
npm start
```

## Health Check

Backend exposes a health endpoint:

```http
GET /
```

Expected response:

```json
{
  "status": "ok",
  "rooms": 0
}
```

## Gameplay

### 1. Create Room

A host creates a room and receives a unique 4-letter room code.

### 2. Join Room

Players enter:

* Room code
* Display name

Supported player count:

```text
4–8 Players
```

### 3. Select Category

Available categories:

* 🌍 General
* 👨‍👩‍👧 Family
* 🔞 Adult

### 4. Role Assignment

The server randomly assigns:

* 1 Imposter
* Remaining players receive the secret topic

Only non-imposters can see the topic.

### 5. Clue Phase

Each player submits a one-word clue related to the topic.

### 6. Discussion Phase

Players enter a 30-second discussion round.

Features:

* Live chat system
* Real-time message delivery
* Message synchronization across all players
* Auto-cleared between rounds

### 7. Voting Phase

Players vote for who they believe is the imposter.

* One vote per player
* Votes lock once submitted

### 8. Results Phase

The game reveals:

* Vote breakdown
* Eliminated player
* Whether the eliminated player was the imposter

### 9. Score Update

Scores are updated automatically.

### 10. Final Leaderboard

After the configured number of rounds, final standings are displayed and a winner is crowned.

## Scoring System

| Outcome                                 | Points |
| --------------------------------------- | ------ |
| Correctly vote for the imposter         | +2     |
| Imposter survives voting                | +3     |
| Caught imposter correctly guesses topic | +1     |

## Project Structure

```text
Imposter_game/
│
├── ai-logs/
│   ├── README.md
│   ├── qoder-session-1.md
│   ├── qoder-session-2.md
│   ├── qoder-session-3.md
│   └── codex-audit.md
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── scripts/
│   │   └── build.mjs
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   └── GameContext.jsx
│       ├── hooks/
│       │   └── useSocket.js
│       └── screens/
│           ├── Home.jsx
│           ├── Lobby.jsx
│           ├── RoleReveal.jsx
│           ├── CluePhase.jsx
│           ├── Discussion.jsx
│           ├── Voting.jsx
│           └── Results.jsx
│
├── server/
│   ├── index.js
│   ├── gameManager.js
│   ├── topics.js
│   └── package.json
│
└── README.md
```

## Deployment

### Deploy Backend on Railway

1. Create a new Railway project.
2. Connect the GitHub repository.
3. Set Root Directory:

```text
server
```

4. Configure environment variables:

```env
CLIENT_ORIGIN=https://your-app.vercel.app
```

5. Deploy using:

```bash
npm start
```

6. Copy the Railway public URL.

Example:

```text
https://your-app.up.railway.app
```

### Deploy Frontend on Vercel

1. Import the GitHub repository.
2. Set Root Directory:

```text
client
```

3. Framework:

```text
Vite
```

4. Configure:

```env
VITE_SERVER_URL=https://your-app.up.railway.app
```

5. Build Command:

```bash
npm run build
```

6. Output Directory:

```text
dist
```

7. Deploy.

## Multiplayer & Networking Notes

The game uses:

* Polling-first Socket.io transport
* Automatic WebSocket upgrade when available
* Infinite reconnection attempts
* Extended connection timeout
* Retry button for failed connections
* Graceful leave-room handling
* Host reassignment when required
* Automatic cleanup of disconnected players

These improvements were added to improve compatibility across mobile browsers, public WiFi, and restrictive networks.

## Known Limitations

* All room data is stored in memory.
* Server restarts remove active rooms.
* No persistent user accounts.
* No permanent leaderboard.
* No database integration.
* Chat messages are not stored after a round ends.
* Horizontal scaling would require a shared Socket.io adapter such as Redis.
* Optimized for groups of 4–8 players.
* Voice chat is not built into the application.

## Future Improvements

* Persistent user profiles
* Global leaderboard
* Spectator mode
* Custom topic packs
* Admin moderation tools
* Private room settings
* Friend invitations
* Database-backed game history
* Optional voice-chat integration

## Credits

Built as an AI-assisted coding project submission.

### Development Assistance

* Qoder: project scaffolding, multiplayer systems, deployment guidance, networking improvements, UI redesign, and gameplay iteration.
* Codex: final audit, multiplayer cleanup fixes, accessibility improvements, production-readiness review, and documentation refinement.

## License

This project is provided for educational, entertainment and demonstration purposes.
