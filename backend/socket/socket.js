const Message = require("./../models/messageModel");
const User = require("./../models/userModel");
const { encrypt } = require("./../utils/encryption");

const onlineUsers = {}; // Store online users { userId: socketId }

module.exports = function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // --- Team Chat event as before ---
    socket.on("joinTeamChat", async ({ teamId, userId }) => {
      if (!userId) {
        console.log("❌ Missing userId, cannot join team chat");
        console.log("Your team id is ", teamId);
        return;
      }
      onlineUsers[userId] = socket.id;
      socket.join(teamId.toString());
      const userIds = Object.keys(onlineUsers);
      const users = await User.find({ _id: { $in: userIds } }).select("name");
      console.log(`✅ User ${userId} joined team chat: ${teamId}`);
      io.to(teamId.toString()).emit("updateOnlineUsers", users);
    });

    // --- New Recruit Players event ---
    socket.on("joinRecruitPlayers", async ({ userId }) => {
      if (!userId) {
        console.log("❌ Missing userId for recruit players");
        return;
      }
      // Mark user as online
      onlineUsers[userId] = socket.id;
      // Join a common room for recruit players updates
      socket.join("recruitPlayers");

      // Fetch all users from your database
      const allUsers = await User.find({}).select("name _id");

      // Determine online user IDs
      const onlineUserIds = Object.keys(onlineUsers);

      // Emit online status to only the recruit players room
      io.to("recruitPlayers").emit("updateOnlineUsers", {
        allUsers,
        onlineUserIds,
      });
    });

    socket.on("sendMessage", async ({ teamId, sender, message }) => {
      if (!teamId || !sender || !message) return;
      const { encryptedData, iv } = encrypt(message);
      try {
        let newMessage = await Message.create({
          teamId,
          sender,
          content: encryptedData,
          iv,
        });
        newMessage = await newMessage.populate("sender", "name email avatar");
        io.to(teamId).emit("receiveMessage", {
          ...newMessage._doc,
          content: message,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("🔌 User disconnected");
      // Find and remove the disconnected user from onlineUsers
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (userId) {
        delete onlineUsers[userId];
        // When a user disconnects, update recruit players room
        const allUsers = await User.find({}).select("name _id");
        const onlineUserIds = Object.keys(onlineUsers);
        io.to("recruitPlayers").emit("updateOnlineUsers", {
          allUsers,
          onlineUserIds,
        });
      }
    });
  });
};
