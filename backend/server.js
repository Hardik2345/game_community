const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const SocketIO = require("socket.io");
const chatSocket = require("./socket/socket");

process.on("uncaughtException", (err) => {
  console.log("Unhandled exception! 💥 shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");
const server = http.createServer(app);
const io = SocketIO(server, {
  cors: { origin: "*" },
  transports: ["websocket"], // Force WebSockets, disable polling
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

//Explicitly set the NODE_ENV for Express
app.set("env", process.env.NODE_ENV);

console.log("Enviroment:", process.env.NODE_ENV);

mongoose.connect(DB).then((con) => {
  console.log("DB connection succesful!");
});

chatSocket(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("App running on port 3000....");
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! 💥 shutting down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECIEVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});
