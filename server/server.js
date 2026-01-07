import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";

// Create Express App and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// ✅ FIXED HEALTH CHECK ROUTE
app.get("/api/status", (req, res) => {
  res.send("Server is Online");
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log("Server is Running on PORT " + PORT);
});
