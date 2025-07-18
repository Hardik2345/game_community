const { Worker } = require("bullmq");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load models and utils
const Message = require("./models/messageModel");
const User = require("./models/userModel"); 
const { encrypt } = require("./utils/encryption");

// Load environment variables
dotenv.config({ path: "./config.env" });

// --- Database Connection ---
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("Worker DB connection successful!");
});

// --- Redis Connection ---
const redisConnection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// --- Create a dummy IO server instance ---
// This instance will not listen for connections, it only connects
// to Redis to be able to broadcast messages.
const io = new Server({
  adapter: createAdapter(redisConnection, redisConnection.duplicate()),
});

console.log("👷 Worker is running and waiting for jobs...");

// --- Create the Worker ---
const worker = new Worker('chat-messages', async (job) => {
    const { tempId, teamId, gameId, sender, message } = job.data;
    const roomId = teamId || gameId; // Determine the room ID

    if (!roomId) {
      console.error("Job is missing teamId or gameId", job.data);
      return;
    }

    try {
      const { encryptedData, iv } = encrypt(message);

      // Create the correct payload for the database
      const dbPayload = {
        sender,
        content: encryptedData,
        iv,
      };
      if (teamId) dbPayload.teamId = teamId;
      if (gameId) dbPayload.gameId = gameId;

      let newMessage = await Message.create(dbPayload);
      
      // We must populate manually after creation for the broadcast
      newMessage = await newMessage.populate("sender", "name email avatar");

      // Broadcast the message to the correct room.
      // Send the DECRYPTED message back to the client, as before.
      io.to(roomId).emit("receiveMessage", {
        ...newMessage._doc,
        content: message, // Send original, unencrypted message
        // tempId, // Include tempId for acknowledgment
      });
    } catch (error) {
      console.error("Error processing message job:", error);
      // It's important to throw the error so BullMQ knows the job failed
      throw error; 
    }
  },
  { connection: redisConnection.duplicate() }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`❌ Job ${job.id} has failed with ${err.message}`);
});