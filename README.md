# messaging-websocket-poc

A small proof of concept for real time messaging using raw WebSockets. Built while testing messaging options for Lockd, a dating app project.

## What this proves

Can a FastAPI server hold connections from multiple clients at once and relay messages between them in real time, without using a third party messaging service.

## How it works

```
Client A (alice)                FastAPI Server                Client B (bob)
       │                     (in memory client registry)             │
       │──── connect: /ws/alice ─────>│                              │
       │                               │<──── connect: /ws/bob ──────│
       │                               │                              │
       │── {"to": "bob", "message"} ──>│                              │
       │                               │──── relay via bob's socket ─>│
```

Each client opens a persistent WebSocket connection using a client ID. The server keeps a simple in memory map of client_id to connection, and sends each incoming message to the right recipient's open socket.

## Stack

Server: FastAPI, using its built in WebSocket support
Test client: Python with the websockets library
Mobile client: React Native / Expo, using the plain WebSocket API through a small custom hook

## Running it

```bash
# 1. Start the server
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Leave that running. In two more terminals, simulate two users:

```bash
cd test_client
source ../server/venv/bin/activate
pip install websockets
python test_client.py alice
```

```bash
cd test_client
source ../server/venv/bin/activate
python test_client.py bob
```

Then in alice's terminal: `bob hey there!`, it should show up instantly in bob's terminal.

## Running it on Expo

```bash
cd deaddrop-app
npx expo install react-dom react-native-web   # only needed once
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `w` in the terminal to open it in a browser. Either way, you'll land on an identity screen first, type any id (e.g. `alice`) and tap ENTER.

To test the relay with two clients, run it on your phone (as `alice`) and press `w` for a second client in the browser (as `bob`), or any two combinations of device + browser tab. Send a message from one to the other, it should show up instantly on the other side.

Note: `SERVER_URL` in `App.tsx` is currently hardcoded to a specific local IP address, update it to match your own machine's IP (`ipconfig getifaddr en0` on Mac & on Windows: ipconfig and look for IPv4 Address) before running.

## Things I chose to leave out on purpose

The client registry is stored in memory, not something like Redis. That's fine for proving this works on one server, but a real deployment running multiple server instances would need a shared store since each instance would only know about its own connections.

Messages aren't saved anywhere. If someone isn't connected when a message is sent to them, the sender just gets told it didn't go through. Saving messages for later delivery would need a database.

There's no authentication on the connection yet. Right now any client can connect and claim any client ID. Verifying who's actually connecting is separate follow up work, kept out of this POC on purpose so it stays focused on one question at a time.

## What's next

- Verify identity on connection instead of trusting the client ID
- Rate limit messages per connection
- Store messages so offline users get them later
- Look into a shared registry for scaling past one server
- Echo sent messages back to the sender, so their own chat log shows what they said (right now, only the recipient sees the message, the sender's screen doesn't confirm it went out, which fits Deaddrop's "no trace" vibe, but a real chat app would need this)