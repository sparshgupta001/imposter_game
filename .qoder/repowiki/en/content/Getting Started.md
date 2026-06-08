# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [server/package.json](file://server/package.json)
- [server/index.js](file://server/index.js)
- [server/gameManager.js](file://server/gameManager.js)
- [server/topics.js](file://server/topics.js)
- [client/package.json](file://client/package.json)
- [client/vite.config.js](file://client/vite.config.js)
- [client/src/hooks/useSocket.js](file://client/src/hooks/useSocket.js)
- [client/src/context/GameContext.jsx](file://client/src/context/GameContext.jsx)
- [client/src/main.jsx](file://client/src/main.jsx)
- [client/tailwind.config.js](file://client/tailwind.config.js)
- [client/postcss.config.js](file://client/postcss.config.js)
- [.gitignore](file://.gitignore)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Development Setup](#development-setup)
6. [Accessing the Game Locally](#accessing-the-game-locally)
7. [Testing Real-Time Functionality](#testing-real-time-functionality)
8. [Deployment Options](#deployment-options)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Verification Steps](#verification-steps)
11. [Conclusion](#conclusion)

## Introduction
Imposter Game is a real-time multiplayer bluffing game built with React, Vite, Tailwind CSS, Node.js, Express, and Socket.io. One player is secretly the imposter while others receive a shared topic. Players take turns giving one-word clues, discussing suspicions, voting, and revealing roles across multiple rounds. The game features in-memory state management, animated UI effects, and responsive real-time communication.

## Prerequisites
- Node.js: Version 18 or later is recommended for optimal compatibility with modern packages and toolchains.
- npm: Node Package Manager that ships with Node.js.
- Git: For cloning the repository and deploying to platforms like Railway and Vercel.

These requirements are standard for running the React + Vite frontend and Node.js + Socket.io backend stack.

**Section sources**
- [README.md:82-86](file://README.md#L82-L86)

## Installation
Follow these step-by-step instructions to install both server and client dependencies.

- Navigate to the server directory and install dependencies:
  - Change directory to server: cd server
  - Install server dependencies: npm install

- Navigate to the client directory and install dependencies:
  - Change directory to client: cd ../client
  - Install client dependencies: npm install

- Verify installation:
  - Both servers should report successful dependency resolution without errors.
  - The client will install React, Vite, Tailwind CSS, Socket.io client, and confetti animations.

Notes:
- The server uses Express and Socket.io for real-time communication.
- The client uses React 18 with Vite for fast development builds and Tailwind CSS for styling.

**Section sources**
- [README.md:7-23](file://README.md#L7-L23)
- [server/package.json:1-16](file://server/package.json#L1-L16)
- [client/package.json:1-26](file://client/package.json#L1-L26)

## Environment Configuration
Configure environment variables for both server and client to match your deployment targets.

- Server environment variables:
  - PORT: The port the server listens on. Default is 3001. Example: PORT=3001

- Client environment variables:
  - VITE_SERVER_URL: The Socket.io server URL that the client connects to. Default is http://localhost:3001. Example: VITE_SERVER_URL=https://your-railway-app.up.railway.app

- Local development defaults:
  - The client’s Vite configuration proxies WebSocket connections to the server on port 3001 during development.

- Environment file placement:
  - Create a .env file in the root of the repository to persist environment variables locally. The .gitignore already excludes .env files from version control.

**Section sources**
- [README.md:48-61](file://README.md#L48-L61)
- [client/vite.config.js:6-14](file://client/vite.config.js#L6-L14)
- [.gitignore:3](file://.gitignore#L3)

## Development Setup
Start both the server and client in separate terminals for a smooth development experience with hot reload.

- Terminal 1: Start the server
  - Change to server directory: cd server
  - Start the server in development mode: npm run dev
  - The server runs on port 3001 by default and watches for file changes.

- Terminal 2: Start the client
  - Change to client directory: cd client
  - Start the Vite development server: npm run dev
  - The client runs on port 5173 by default and enables hot module replacement.

- Proxy configuration:
  - Vite proxies WebSocket traffic for /socket.io to http://localhost:3001, ensuring seamless real-time communication during development.

- Hot reload:
  - Changes to client code trigger instant UI updates.
  - Server changes automatically restart the Node.js process in development mode.

**Section sources**
- [README.md:16-22](file://README.md#L16-L22)
- [server/package.json:6-9](file://server/package.json#L6-L9)
- [client/vite.config.js:6-14](file://client/vite.config.js#L6-L14)

## Accessing the Game Locally
Once both servers are running, access the game from your browser or mobile device.

- Open the client in your browser:
  - Visit http://localhost:5173 in your desktop or mobile browser.

- Mobile devices:
  - On your phone, open the same URL as your computer (ensure both devices are on the same network).

- Initial screen:
  - You will land on the Home screen where you can create or join a room.

- Room creation and joining:
  - Host creates a room and receives a 4-letter code.
  - Other players join using the code and a display name.

**Section sources**
- [README.md:25](file://README.md#L25)
- [client/src/main.jsx:7-13](file://client/src/main.jsx#L7-L13)

## Testing Real-Time Functionality
Validate that real-time events are working correctly across multiple players.

- Create a room:
  - Host creates a room and receives a 4-letter code.
  - Confirm the lobby screen loads and the host flag is set.

- Join the room:
  - Other players join using the code and a display name.
  - Verify player list updates and toast notifications appear.

- Start the game:
  - Host selects a category and starts the game.
  - Role assignments are sent privately to each player.
  - The game advances to the role reveal phase.

- Clue submission:
  - Players submit one-word clues.
  - Confirm clue appears in the discussion phase for all players.

- Voting:
  - Players vote for who they suspect is the imposter.
  - Votes are tallied and results are revealed with staggered animations.

- Imposter guess:
  - The imposter can submit a guess for the topic.
  - Results indicate whether the guess was correct.

- Next round and final results:
  - Host advances rounds until the game ends.
  - Final standings are displayed with winners.

- Reconnection:
  - Simulate disconnection and reconnection to verify graceful handling.

**Section sources**
- [README.md:27-38](file://README.md#L27-L38)
- [server/index.js:173-676](file://server/index.js#L173-L676)
- [client/src/context/GameContext.jsx:70-254](file://client/src/context/GameContext.jsx#L70-L254)

## Deployment Options
Deploy the server and client independently for production environments.

- Server deployment to Railway:
  - Push the repository to GitHub.
  - Create a new project on Railway and deploy from GitHub.
  - Set Root Directory to server.
  - Add environment variable: PORT=3001.
  - Railway auto-detects Node.js and runs npm start.
  - Note the Railway URL (e.g., https://your-app.up.railway.app).

- Client deployment to Vercel:
  - Create a new project on Vercel and import your GitHub repository.
  - Set Root Directory to client.
  - Select Vite as the framework preset.
  - Add environment variable: VITE_SERVER_URL=https://your-railway-app.up.railway.app.
  - Deploy the client.

- Production ports:
  - Server runs on the configured PORT (default 3001).
  - Client runs on Vercel’s managed CDN and serves static assets.

**Section sources**
- [README.md:62-79](file://README.md#L62-L79)

## Troubleshooting Guide
Common setup and runtime issues with solutions.

- Port conflicts:
  - Symptom: Server fails to start on port 3001.
  - Solution: Change PORT in environment variables or stop the conflicting service.

- CORS errors:
  - Symptom: Client cannot connect to server in development.
  - Solution: Ensure the server allows cross-origin requests and the client points to the correct VITE_SERVER_URL.

- Socket connection failures:
  - Symptom: UI shows disconnected state or no real-time updates.
  - Solution: Verify VITE_SERVER_URL matches the deployed server URL. Check browser console for connection errors.

- Proxy issues in Vite:
  - Symptom: WebSocket connections fail during development.
  - Solution: Confirm Vite proxy configuration targets the correct server URL and port.

- Name collisions:
  - Symptom: Cannot join a room due to duplicate names.
  - Solution: Choose a unique display name in the lobby.

- Full room:
  - Symptom: Cannot join a room that already has 8 players.
  - Solution: Wait for a room to clear or create a new one.

- Reconnection timeouts:
  - Symptom: Disconnected players are removed after 30 seconds.
  - Solution: Reconnect promptly or ensure stable network connectivity.

**Section sources**
- [server/index.js:20-25](file://server/index.js#L20-L25)
- [client/vite.config.js:8-13](file://client/vite.config.js#L8-L13)
- [server/gameManager.js:100-113](file://server/gameManager.js#L100-L113)

## Verification Steps
Confirm a successful installation and setup.

- Server health check:
  - Visit http://localhost:3001 in your browser to confirm the server responds with a JSON status and room count.

- Client build:
  - Run npm run build in the client directory to verify the build completes without errors.

- Socket connection:
  - Open http://localhost:5173 and verify the client connects to the server (indicated by connected state and lobby loading).

- Real-time events:
  - Create a room, add a few test players, and simulate a full round (clue, discussion, voting, results) to ensure all events flow correctly.

- Environment variables:
  - Confirm VITE_SERVER_URL points to the correct server address and PORT is set appropriately for the server.

**Section sources**
- [server/index.js:33-35](file://server/index.js#L33-L35)
- [client/src/hooks/useSocket.js:4](file://client/src/hooks/useSocket.js#L4)

## Conclusion
You now have everything needed to run Imposter Game locally, develop features with hot reload, and deploy to production. Use the provided environment variables, development scripts, and deployment instructions to get started quickly. Test real-time functionality across multiple players and verify all game phases work as expected. For persistent deployments, follow the Railway and Vercel instructions to host the server and client separately.