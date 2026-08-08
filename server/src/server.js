import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

import http from "http";
import { initializeSocket } from "./config/socket.js";
import { socketMiddleware, } from "./middleware/socketMiddleware.js";
import { startDeadlineJob } from "./utils/deadlineJob.js";

// Connect Database
await connectDB();

const PORT = process.env.PORT || 5000;

startDeadlineJob();

const httpServer = http.createServer(app);
const io = initializeSocket(httpServer);
io.use(socketMiddleware);

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();

  socket.join(`user:${userId}`);
  console.log(`Socket connected: ${socket.user.name}`);
  console.log(`User ID: ${userId}`);
  console.log(`Joined room: user:${userId}`);
  // console.log("Socket rooms:",[...socket.rooms]);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user.name}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});