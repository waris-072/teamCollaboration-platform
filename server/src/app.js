import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import taskCommentRoutes from "./routes/taskCommentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", taskCommentRoutes);
app.use("/api", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TeamFlow API Running",
  });
});

export default app;