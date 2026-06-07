# Imposter Game

A real-time multiplayer party bluffing game. One player is secretly the imposter — everyone else knows the topic. Can you figure out who's faking it?

## Quick Start

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start the server (in one terminal)
cd server
npm run dev

# Start the client (in another terminal)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) on your phone or browser.

## How to Play

1. **Host creates a room** → gets a 4-letter shareable code (e.g. `KQZM`)
2. **4–8 players join** via code, pick a display name
3. **Host picks a category** (General / Family / Adult) and starts the game
4. **Server assigns one imposter** — they don't know the topic; everyone else does
5. **Clue phase (60s)** — each player gives a one-word clue
6. **Discussion (60s)** — open debate about who the imposter is
7. **Voting** — everyone votes for who they think the imposter is
8. **Reveal** — votes are shown one-by-one, then the imposter is revealed
9. **Scoring** — scores accumulate across 3 rounds
10. **Final standings** — winner gets the crown

## Scoring

| Outcome | Points |
|---|---|
| Players correctly vote out imposter | +2 each |
| Imposter survives the vote | +3 to imposter |
| Imposter caught but guesses the word | +1 consolation |

## Environment Variables

### Server

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |

### Client

| Variable | Default | Description |
|---|---|---|
| `VITE_SERVER_URL` | `http://localhost:3001` | Socket.io server URL |

## Deployment

### Server → Railway

1. Push this repo to GitHub
2. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Set the **Root Directory** to `server`
4. Add environment variable: `PORT=3001`
5. Railway will auto-detect Node.js and run `npm start`
6. Note your Railway URL (e.g. `https://imposter-game-server.up.railway.app`)

### Client → Vercel

1. Go to [Vercel](https://vercel.com) → New Project → Import your GitHub repo
2. Set the **Root Directory** to `client`
3. Set **Framework Preset** to Vite
4. Add environment variable: `VITE_SERVER_URL=https://your-railway-app.up.railway.app`
5. Deploy

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io
- **State:** In-memory (no database needed)
- **Animations:** CSS transitions + canvas-confetti

## Project Structure

```
imposter-game/
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── gameManager.js    # Room/game state machine
│   └── topics.js         # Word packs (30+ per category)
├── client/
│   ├── src/
│   │   ├── App.jsx              # Screen router + transitions
│   │   ├── screens/
│   │   │   ├── Home.jsx         # Create / join room
│   │   │   ├── Lobby.jsx        # Player list, category picker
│   │   │   ├── RoleReveal.jsx   # Tap-to-reveal role card
│   │   │   ├── CluePhase.jsx    # Timer + clue input
│   │   │   ├── Discussion.jsx   # Timer + clue review
│   │   │   ├── Voting.jsx       # Tap-to-vote UI
│   │   │   └── Results.jsx      # Staggered reveal + scoreboard
│   │   ├── hooks/useSocket.js   # Socket.io connection hook
│   │   └── context/GameContext.jsx  # Global state + actions
│   └── index.html
└── README.md
```

## Socket Events

| Client → Server | Data | Response |
|---|---|---|
| `createRoom` | `{ playerName }` | `roomCreated { code }` |
| `joinRoom` | `{ code, name }` | `playerJoined { players }` |
| `startGame` | `{ category }` | `roleAssigned { role, topic? }` (per socket) |
| `submitClue` | `{ clue }` | `clueReceived { playerId, clue }` |
| `submitVote` | `{ targetId }` | `voteSubmitted { voterId }` |
| `imposterGuess` | `{ guess }` | `imposterGuessResult { correct }` |
| `nextRound` | — | `phaseChanged` / `gameOver` |
| `playAgain` | — | `phaseChanged { phase: 'lobby' }` |
| `reconnect` | `{ code, name }` | `reconnected { ...state }` |

| Server → Client | Data |
|---|---|
| `timerTick` | `{ secondsLeft }` |
| `phaseChanged` | `{ phase }` |
| `roundResult` | `{ imposterId, wasImposter, scores, votes, topic }` |
| `gameOver` | `{ players, winner }` |
| `playerDisconnected` | `{ playerId, playerName, players }` |
| `playerReconnected` | `{ playerId, playerName, players }` |
