import { Server } from "socket.io";
import type { HttpServer } from "vite";

export let io: Server | null = null;

export default function injectSocketIO(server: HttpServer | null) {
    if (!server) {
        console.error("SocketIO injection failed, no server provided");
        process.exit(1);
    }
    io = new Server(server);
}

export function refresh() {
    io?.emit("refresh");
}
