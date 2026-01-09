import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express App and HTTP server
const app = express();
const server = http.createServer(app);

// Iniate socket_is server 
export const io = new Server(server, {
    cors: {origin:"*"}
})

//Store onile user 
export const userSocketMap = {}; // {userId:socketId}

//Socket.io connection handler 
io.on("connection", (socket)=> {
    const  userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all connected client 
    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("disconnect", ()=> {
        console.log("User Disconnected", userId)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})
// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());



app.get("/api/status", (req, res) => {res.send("Server is Online");});
app.use("/api/auth", userRouter)
app.use("/api/messages",messageRouter)

//Connect to MongoDb
await connectDB()

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
console.log("Server is Running on PORT " + PORT);});
