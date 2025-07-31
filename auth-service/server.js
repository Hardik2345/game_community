const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const http = require("http");

process.on("uncaughtException", (err) => {
  console.log("Unhandled exception! 💥 shutting down....");
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require("./app");
const server = http.createServer(app);

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

const port = process.env.PORT || 3001;
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