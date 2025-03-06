const Message = require("./../models/messageModel"); // ✅ Import using require

module.exports = function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("joinTeamChat", (teamId) => {
      socket.join(teamId);
      console.log(`User joined team chat: ${teamId}`);
    });

    socket.on("sendMessage", async ({ teamId, sender, message }) => {
      if (!teamId || !sender || !message) return;

      try {
        // Save message to database
        let newMessage = await Message.create({
          teamId,
          sender,
          content: message,
        });

        newMessage = await newMessage.populate("sender", "name email avatar");

        // Emit message to all users in the room
        io.to(teamId).emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 User disconnected");
    });
  });
};
