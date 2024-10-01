// webSocketPluginVite.js
import type { ViteDevServer, Plugin } from "vite";
import injectSocketIO from "./socketIoHandler.js";

export const webSocketServer = {
    name: "webSocketServer",
    configureServer(server: ViteDevServer) {
        injectSocketIO(server.httpServer);
    },
} satisfies Plugin;
