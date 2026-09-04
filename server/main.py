from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict

app = FastAPI()

# Maps a connected client's id to their live WebSocket connection.
# Lives in memory, so it resets if the server restarts and only works
# for a single server process. A multi server setup would need a shared
# store like Redis instead.
connected_clients: Dict[str, WebSocket] = {}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    connected_clients[client_id] = websocket
    print(f"[connect] '{client_id}' connected. Online: {list(connected_clients.keys())}")

    try:
        while True:
            data = await websocket.receive_json()
            recipient_id = data.get("to")
            message = data.get("message")

            print(f"[message] '{client_id}' -> '{recipient_id}': {message}")

            recipient_ws = connected_clients.get(recipient_id)
            if recipient_ws:
                await recipient_ws.send_json({
                    "from": client_id,
                    "message": message,
                })
            else:
                await websocket.send_json({
                    "from": "server",
                    "message": f"'{recipient_id}' is not currently connected.",
                })

    except WebSocketDisconnect:
        if client_id in connected_clients:
            del connected_clients[client_id]
        print(f"[disconnect] '{client_id}' disconnected. Remaining: {list(connected_clients.keys())}")


@app.get("/")
def health_check():
    return {"status": "ok", "online_clients": list(connected_clients.keys())}
