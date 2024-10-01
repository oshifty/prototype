import { Server } from "socket.io";
import type { HttpServer } from "vite";

export default function injectSocketIO(server: HttpServer | null) {
    if (!server) {
        console.error("SocketIO injection failed, no server provided");
        process.exit(1);
    }
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("a user connected");
    });
}
