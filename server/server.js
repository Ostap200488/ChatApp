import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// =======================
// CONFIG
// =======================
const CLIENT_URL = "http://localhost:5173";
const PORT = process.env.PORT || 5001;

// =======================
// APP & SERVER
// =======================
const app = express();
const server = http.createServer(app);

// =======================
// MIDDLEWARE (IMPORTANT ORDER)
// =======================
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// If you send base64 images, 4mb might be too small.
// Use 10mb (or 20mb) during dev:
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// =======================
// SOCKET.IO
// =======================
export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);
    if (userId) delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// =======================
// ROUTES
// =======================
app.get("/api/status", (req, res) => {
  res.send("Server is Online");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// =======================
// START SERVER
// =======================
await connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
