const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const chatSocket = require("./socket/socket");
const Redis = require("ioredis");
const { Server } = require("socket.io"); // Use Server from socket.io
const { createAdapter } = require("@socket.io/redis-adapter");
const { Queue } = require("bullmq");

process.on("uncaughtException", (err) => {
  console.log("Unhandled exception! 💥 shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");
const server = http.createServer(app);
const io = new Server(server, { // Changed from SocketIO(server, ...)
  cors: { origin: "*" },
  transports: ["websocket"],
});
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null // Important for adapter and bullmq
});

// 1. Create the BullMQ queue instance
const chatQueue = new Queue('chat-messages', { connection: redisConnection.duplicate() });

// 2. Configure the Socket.IO adapter to use Redis
io.adapter(createAdapter(redisConnection, redisConnection.duplicate()));

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

//Explicitly set the NODE_ENV for Express
app.set("env", process.env.NODE_ENV);

console.log("Environment:", process.env.NODE_ENV);

mongoose.connect(DB).then((con) => {
  console.log("DB connection successful!");
});

chatSocket(io, chatQueue);
require('./listeners/userListener');

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! 💥 shutting down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});