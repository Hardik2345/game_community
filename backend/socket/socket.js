const Message = require("./../models/messageModel"); // ✅ Import using require
const { encrypt } = require("./../utils/encryption");

module.exports = function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("joinTeamChat", (teamId) => {
      socket.join(teamId);
      console.log(`User joined team chat: ${teamId}`);
    });

    socket.on("sendMessage", async ({ teamId, sender, message }) => {
      if (!teamId || !sender || !message) return;

      const { encryptedData, iv } = encrypt(message);

      try {
        // Save message to database
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

    socket.on("disconnect", () => {
      console.log("🔌 User disconnected");
    });
  });
};
