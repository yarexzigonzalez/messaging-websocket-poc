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
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. In two more terminals, simulate two users
cd test_client
python test_client.py alice
python test_client.py bob
# in alice's terminal: bob hey!
```

To try it from Expo instead of the terminal client, check `mobile-example/`. Copy `useWebSocket.ts` and `ChatTestScreen.tsx` into an Expo app and point `SERVER_URL` at your machine's local network IP.

## Things I chose to leave out on purpose

The client registry is stored in memory, not something like Redis. That's fine for proving this works on one server, but a real deployment running multiple server instances would need a shared store since each instance would only know about its own connections.

Messages aren't saved anywhere. If someone isn't connected when a message is sent to them, the sender just gets told it didn't go through. Saving messages for later delivery would need a database.

There's no authentication on the connection yet. Right now any client can connect and claim any client ID. Verifying who's actually connecting is separate follow up work, kept out of this POC on purpose so it stays focused on one question at a time.

## What's next

- Verify identity on connection instead of trusting the client ID
- Rate limit messages per connection
- Store messages so offline users get them later
- Look into a shared registry for scaling past one server
