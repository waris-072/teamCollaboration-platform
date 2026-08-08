import { Server } from "socket.io";

let io;
export function initializeSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    console.log("Socket.IO initialized.");
    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized.");
    }
    return io;
}