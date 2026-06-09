# Imposter Game

A real-time multiplayer social deduction game for phones and browsers. One player is secretly the imposter, everyone else knows the topic, and the group has to use clues, discussion, and voting to find out who is faking it.

## Features

- Real-time multiplayer rooms with Socket.io
- 4-letter room codes for quick sharing
- Host-controlled category selection
- Private role reveal for each player
- One-word clue phase with server-side timers
- Discussion and voting phases
- Animated vote reveal and scoreboard
- Multi-round scoring with final standings
- Reconnect support after short network drops
- Mobile-friendly light theme
- Polling-first Socket.io transport for difficult mobile networks
- Clean leave-room flow with host reassignment

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express, Socket.io
- Realtime: Socket.io client/server
- State: In-memory server rooms
- UI effects: CSS animations, canvas-confetti

## Installation

Install the backend dependencies:

```bash
cd server
npm install
```

Install the frontend dependencies:

```bash
cd ../client
npm install
```

## Environment Variables

### Server

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | Port used by the Express and Socket.io server. |
| `CLIENT_ORIGIN` | `*` | Optional allowed frontend origin. Use the deployed Vercel URL in production. Multiple origins may be comma-separated. |

### Client

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_SERVER_URL` | `http://localhost:3001` | URL of the Socket.io backend. Set this to the Railway backend URL in production. |

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

For phone testing on the same network, expose the Vite dev server with a host flag and set the client to use a reachable backend URL.

## Production Build

Build the frontend:

```bash
cd client
npm run build
```

Preview the frontend build:

```bash
npm run preview
```

Start the backend:

```bash
cd server
npm start
```

The backend health check is available at:

```text
GET /
```

Expected response:

```json
{"status":"ok","rooms":0}
```

## Gameplay

1. A host creates a room and receives a 4-letter code.
2. Players join with the room code and a display name.
3. The host selects a category and starts the game.
4. The server chooses one imposter and one secret topic.
5. Non-imposters see the topic. The imposter does not.
6. Each player submits a one-word clue.
7. The group reviews the clues and decides who seems suspicious.
8. Each player votes for another player.
9. Votes are revealed, then the imposter is revealed.
10. Scores update over 3 rounds, then final standings are shown.

## Scoring

| Outcome | Points |
| --- | --- |
| Players correctly vote out the imposter | +2 to each correct voter |
| Imposter survives the vote | +3 to the imposter |
| Caught imposter correctly guesses the topic | +1 consolation point |

## Project Structure

```text
Imposter_game/
  ai-logs/
    README.md
  client/
    index.html
    package.json
    scripts/
      build.mjs
    src/
      App.jsx
      index.css
      context/
        GameContext.jsx
      hooks/
        useSocket.js
      screens/
        Home.jsx
        Lobby.jsx
        RoleReveal.jsx
        CluePhase.jsx
        Discussion.jsx
        Voting.jsx
        Results.jsx
  server/
    index.js
    gameManager.js
    topics.js
    package.json
  README.md
```

## Deployment

### Backend on Railway

1. Create a Railway project from the GitHub repository.
2. Set the Railway root directory to `server`.
3. Set `PORT` if Railway does not provide one automatically.
4. Set `CLIENT_ORIGIN` to the deployed frontend URL for tighter CORS.
5. Deploy with the default start command:

```bash
npm start
```

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set the Vercel root directory to `client`.
3. Set the framework preset to Vite.
4. Set `VITE_SERVER_URL` to the Railway backend URL.
5. Build with:

```bash
npm run build
```

The frontend build script uses Vite programmatically for production and skips loading the dev-only Vite config file. Local development still uses `vite.config.js` for the `/socket.io` proxy.

## Known Limitations

- Rooms are stored in memory, so restarting the backend clears active rooms.
- Horizontal scaling needs sticky sessions or a shared Socket.io adapter.
- There is no account system or persistent leaderboard.
- The game is optimized for small groups of 4 to 8 players.
- Voice chat is not built in; discussion happens outside the app.
- If a player disconnects, they have a short grace period to reconnect before being removed.

## Credits

Built as an AI-assisted coding contest submission.

Development assistance included AI coding tools, with final audit and fixes performed in Codex.
