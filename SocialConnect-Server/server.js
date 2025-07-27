require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const morgan = require("morgan");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const friendRoutes = require("./routes/friends");
const uploadRoutes = require("./routes/upload");
const { authenticateSocket } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// REST API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/upload", uploadRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

app.set("io", io);

// Socket.io auth & rooms
io.use(authenticateSocket).on("connection", (socket) => {
  const uid = socket.userId;
  socket.join(uid);
  console.log(`🔌 Socket connected: ${uid}`);
  socket.on("disconnect", () => console.log(`❌ Socket disconnected: ${uid}`));
});

// Mongo + start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server on port ${process.env.PORT}`);
    })
  )
  .catch((err) => console.error("MongoDB error:", err));
