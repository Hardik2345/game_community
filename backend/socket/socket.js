const Message = require("./../models/messageModel"); // ✅ Import using require
const User = require("./../models/userModel");
const { encrypt } = require("./../utils/encryption");

const onlineUsers = {}; // Store online users { userId: socketId }

module.exports = function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("joinTeamChat", async ({ teamId, userId }) => {
      if (!userId) {
        console.log("❌ Missing userId, cannot join team chat");
        console.log("Your team id is ", teamId);
        return;
      }

      // const team = await Team.findOne({ name: teamName });
      // if (!team) {
      //   console.log(`❌ Team not found: ${teamName}`);
      //   return;
      // }

      // const teamId = team._id;

      // Store user as online
      onlineUsers[userId] = socket.id;
      socket.join(teamId.toString());
      const userIds = Object.keys(onlineUsers);

      const users = await User.find({ _id: { $in: userIds } }).select("name");

      console.log(`✅ User ${userId} joined team chat: ${teamId}`);
      io.to(teamId.toString()).emit("updateOnlineUsers", users);
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

        // Emit message to all users in the room
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

      // Remove user from online list
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (userId) {
        delete onlineUsers[userId];
        const userIds = Object.keys(onlineUsers);

        const users = await User.find({ _id: { $in: userIds } }).select("name");
        io.emit("updateOnlineUsers", users); // Notify clients
      }
    });
  });
};
