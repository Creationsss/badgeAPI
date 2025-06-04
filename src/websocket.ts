import { echo } from "@atums/echo";
import type { ServerWebSocket } from "bun";

class WebSocketHandler {
	public handleMessage(ws: ServerWebSocket, message: string): void {
		echo.info(`WebSocket received: ${message}`);
		try {
			ws.send(`You said: ${message}`);
		} catch (error) {
			echo.error({
				message: "WebSocket send error",
				error: (error as Error).message,
			});
		}
	}

	public handleOpen(ws: ServerWebSocket): void {
		echo.info("WebSocket connection opened.");
		try {
			ws.send("Welcome to the WebSocket server!");
		} catch (error) {
			echo.error({
				message: "WebSocket send error",
				error: (error as Error).message,
			});
		}
	}

	public handleClose(_ws: ServerWebSocket, code: number, reason: string): void {
		echo.info(`WebSocket closed with code ${code}, reason: ${reason}`);
	}
}

const webSocketHandler: WebSocketHandler = new WebSocketHandler();

export { webSocketHandler };
