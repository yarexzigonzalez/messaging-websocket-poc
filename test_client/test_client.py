"""
Terminal client for testing the WebSocket server without a mobile app.

Usage:
    python test_client.py alice
    python test_client.py bob

Then type messages as: <recipient_id> <message>
Example: bob hey there!
"""
import asyncio
import sys
import json
import websockets


async def main():
    if len(sys.argv) < 2:
        print("Usage: python test_client.py <your_client_id>")
        return

    my_id = sys.argv[1]
    uri = f"ws://localhost:8000/ws/{my_id}"

    async with websockets.connect(uri) as ws:
        print(f"Connected as '{my_id}'.")
        print("Type messages as: <recipient_id> <message>\n")

        async def listen():
            while True:
                data = await ws.recv()
                parsed = json.loads(data)
                print(f"\n[{parsed['from']}]: {parsed['message']}\n> ", end="", flush=True)

        async def send_loop():
            loop = asyncio.get_event_loop()
            while True:
                line = await loop.run_in_executor(None, input, "> ")
                if " " not in line:
                    print("Format: <recipient_id> <message>")
                    continue
                recipient, message = line.split(" ", 1)
                await ws.send(json.dumps({"to": recipient, "message": message}))

        await asyncio.gather(listen(), send_loop())


if __name__ == "__main__":
    asyncio.run(main())
