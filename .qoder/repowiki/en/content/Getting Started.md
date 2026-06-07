# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [client/package.json](file://client/package.json)
- [client/vite.config.js](file://client/vite.config.js)
- [client/src/hooks/useSocket.js](file://client/src/hooks/useSocket.js)
- [client/src/context/GameContext.jsx](file://client/src/context/GameContext.jsx)
- [client/src/main.jsx](file://client/src/main.jsx)
- [client/index.html](file://client/index.html)
- [client/tailwind.config.js](file://client/tailwind.config.js)
- [server/package.json](file://server/package.json)
- [server/index.js](file://server/index.js)
- [server/topics.js](file://server/topics.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Development Setup](#development-setup)
5. [Local Server and Client Startup](#local-server-and-client-startup)
6. [Environment Variables](#environment-variables)
7. [Accessing the Application Locally](#accessing-the-application-locally)
8. [Development Workflow](#development-workflow)
9. [Verification Steps](#verification-steps)
10. [Expected Behavior During Development](#expected-behavior-during-development)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Conclusion](#conclusion)

## Introduction
This guide helps you set up and run the Imposter Game locally. It covers prerequisites, installation, environment configuration, and the complete development workflow so you can start playing and developing right away.

## Prerequisites
- Node.js: The project requires Node.js to run both the server and client.
- npm: Package manager for installing dependencies.
- Git: Recommended for cloning the repository and managing changes.

These tools are standard for modern web development and are used throughout the project.

**Section sources**
- [README.md:5-25](file://README.md#L5-L25)

## Installation
Follow these steps to install dependencies for both server and client:

1. Install server dependencies
   - Navigate to the server directory and install dependencies.
   - Command: `cd server && npm install`

2. Install client dependencies
   - Navigate to the client directory and install dependencies.
   - Command: `cd ../client && npm install`

Notes:
- The server uses Node.js with Express and Socket.io.
- The client uses React 18 with Vite and Tailwind CSS.

**Section sources**
- [README.md:7-14](file://README.md#L7-L14)
- [server/package.json:1-16](file://server/package.json#L1-L16)
- [client/package.json:1-26](file://client/package.json#L1-L26)

## Development Setup
After installing dependencies, you can start the development servers:

- Start the server (in one terminal):
  - Navigate to the server directory and run the development script.
  - Command: `cd server && npm run dev`

- Start the client (in another terminal):
  - Navigate to the client directory and run the development script.
  - Command: `cd client && npm run dev`

What happens:
- The server runs on port 3001 by default.
- The client runs on port 5173 by default.
- The client proxies Socket.IO WebSocket connections to the server automatically.

**Section sources**
- [README.md:16-23](file://README.md#L16-L23)
- [server/package.json:6-9](file://server/package.json#L6-L9)
- [client/vite.config.js:6-15](file://client/vite.config.js#L6-L15)

## Local Server and Client Startup
- Server startup
  - The server entry point initializes Express, CORS, and Socket.IO.
  - It listens on the configured port (default 3001) and exposes a health endpoint.
  - The server manages game state and broadcasts events to connected clients.

- Client startup
  - The client entry point sets up the React app with the GameProvider.
  - It connects to the Socket.IO server using the configured URL.
  - The client handles all game screens and state updates via Socket.IO events.

Ports:
- Server: 3001 (default)
- Client: 5173 (default)

Proxy:
- The client Vite config proxies `/socket.io` requests to the server at `http://localhost:3001`.

**Section sources**
- [server/index.js:14-28](file://server/index.js#L14-L28)
- [server/index.js:682-687](file://server/index.js#L682-L687)
- [client/src/main.jsx:1-14](file://client/src/main.jsx#L1-L14)
- [client/src/hooks/useSocket.js:4](file://client/src/hooks/useSocket.js#L4)
- [client/vite.config.js:6-15](file://client/vite.config.js#L6-L15)

## Environment Variables
Configure the following environment variables to customize behavior:

- Server
  - PORT: Server port (default: 3001)

- Client
  - VITE_SERVER_URL: Socket.IO server URL (default: http://localhost:3001)

How to set them:
- Set environment variables in your shell session or use a `.env` file in the client directory if supported by your development setup.

Why they matter:
- PORT controls where the server listens.
- VITE_SERVER_URL tells the client where to connect to the Socket.IO server.

**Section sources**
- [README.md:48-61](file://README.md#L48-L61)
- [client/src/hooks/useSocket.js:4](file://client/src/hooks/useSocket.js#L4)
- [client/vite.config.js:6-15](file://client/vite.config.js#L6-L15)

## Accessing the Application Locally
- Open the client in your browser at http://localhost:5173.
- On mobile devices, open the same URL from the device’s browser.
- The client will attempt to connect to the server at the configured URL.

What to expect:
- You should see the home screen where you can create or join a room.
- Once connected, you can invite others to join using the room code.

**Section sources**
- [README.md:25](file://README.md#L25)
- [client/src/hooks/useSocket.js:4](file://client/src/hooks/useSocket.js#L4)

## Development Workflow
Typical development tasks:

- Start both servers
  - Terminal 1: `cd server && npm run dev`
  - Terminal 2: `cd client && npm run dev`

- Build for production
  - Server: `cd server && npm start`
  - Client: `cd client && npm run build`

- Preview client build locally
  - Client: `cd client && npm run preview`

- Hot reload
  - Both server and client support hot reloading during development.

- Socket.IO events
  - The client listens to and emits Socket.IO events defined in the server.
  - Use the developer tools network tab to inspect WebSocket traffic.

**Section sources**
- [README.md:16-23](file://README.md#L16-L23)
- [server/package.json:6-9](file://server/package.json#L6-L9)
- [client/package.json:7-11](file://client/package.json#L7-L11)
- [server/index.js:173-676](file://server/index.js#L173-L676)

## Verification Steps
Confirm your setup is working:

- Server health check
  - Visit http://localhost:3001 in your browser.
  - You should receive a JSON response indicating the server is running and reporting room count.

- Client connectivity
  - Open http://localhost:5173 in your browser.
  - The client should connect to the server and display the home screen.

- Socket.IO connection
  - Open the browser’s developer tools Network tab.
  - Look for WebSocket connections to `/socket.io` and verify they upgrade successfully.

- Basic gameplay
  - Create a room, invite a friend, and start a game.
  - Verify that roles are assigned, clues are submitted, and voting proceeds as expected.

**Section sources**
- [server/index.js:33-35](file://server/index.js#L33-L35)
- [client/src/hooks/useSocket.js:34-57](file://client/src/hooks/useSocket.js#L34-L57)

## Expected Behavior During Development
- Server logs
  - You will see connection messages and game lifecycle events in the server terminal.

- Client behavior
  - The client maintains a persistent connection to the server.
  - It displays real-time updates for timers, phase changes, and game events.
  - Toast notifications appear for player joins, leaves, and errors.

- Proxy behavior
  - WebSocket traffic from the client is proxied to the server automatically via Vite.

- Graceful disconnections
  - The server marks disconnected players and allows reconnection within a grace period.

**Section sources**
- [server/index.js:173-676](file://server/index.js#L173-L676)
- [client/src/context/GameContext.jsx:70-254](file://client/src/context/GameContext.jsx#L70-L254)
- [client/vite.config.js:8-13](file://client/vite.config.js#L8-L13)

## Troubleshooting Guide
Common issues and fixes:

- Port conflicts
  - Problem: Port 3001 or 5173 is already in use.
  - Fix: Change the PORT environment variable for the server or adjust the client port in the Vite config.

- Cannot connect to server
  - Problem: Client cannot reach the server.
  - Check: Ensure VITE_SERVER_URL is set correctly and matches the server address.
  - Verify: The server is running and listening on the expected port.

- CORS errors
  - Problem: Cross-origin requests blocked.
  - Check: The server enables CORS for all origins in development.

- Socket.IO not upgrading to WebSocket
  - Problem: Polling only instead of WebSocket.
  - Check: Confirm the proxy configuration in the client Vite config is correct.

- Player name length errors
  - Problem: Player name too long.
  - Fix: Keep names under 20 characters.

- Reconnection issues
  - Problem: Players disappear after disconnect.
  - Info: The server removes disconnected players after a grace period; reconnect within that time.

- Missing dependencies
  - Problem: Errors about missing packages.
  - Fix: Run `npm install` in both server and client directories.

- Windows-specific issues
  - Problem: Scripts not recognized.
  - Fix: Use `npm run dev` instead of bash-style commands, or run from a shell that supports them.

**Section sources**
- [README.md:48-61](file://README.md#L48-L61)
- [client/vite.config.js:6-15](file://client/vite.config.js#L6-L15)
- [server/index.js:20-25](file://server/index.js#L20-L25)
- [server/index.js:223-224](file://server/index.js#L223-L224)
- [client/src/hooks/useSocket.js:21-29](file://client/src/hooks/useSocket.js#L21-L29)

## Conclusion
You now have everything needed to run the Imposter Game locally. Start both the server and client, verify connectivity, and begin testing gameplay. Use the troubleshooting section if you encounter issues, and refer back to the environment variables and ports as needed.