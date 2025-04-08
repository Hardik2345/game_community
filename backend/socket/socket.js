const Message = require("./../models/messageModel");
const User = require("./../models/userModel");
const { encrypt } = require("./../utils/encryption");

// We'll still keep a global mapping for the "recruitPlayers" room,
// but for team chats we will use room membership.
const onlineRecruitUsers = {}; // For recruitPlayers only: { userId: socket.id }

module.exports = function chatSocket(io) {
  // Helper function to update online users for a given room (team chat)
  async function updateRoomOnlineUsers(room) {
    // io.sockets.adapter.rooms is a Map in Socket.IO v3+
    const roomSockets = io.sockets.adapter.rooms.get(room);
    let userIds = [];
    if (roomSockets) {
      for (const socketId of roomSockets) {
        const clientSocket = io.sockets.sockets.get(socketId);
        if (clientSocket && clientSocket.userId) {
          userIds.push(clientSocket.userId);
        }
      }
    }
    const users = await User.find({ _id: { $in: userIds } }).select("name");
    io.to(room).emit("updateOnlineUsers", users);
  }

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // --- Team Chat Event ---
    socket.on("joinTeamChat", async ({ teamId, userId }) => {
      if (!userId || !teamId) {
        console.log("❌ Missing userId or teamId, cannot join team chat");
        return;
      }

      // If the user was in a previous team room, remove them from that room and update it.
      if (socket.teamId && socket.teamId !== teamId.toString()) {
        socket.leave(socket.teamId);
        console.log(`🔄 User ${userId} left team chat: ${socket.teamId}`);
        updateRoomOnlineUsers(socket.teamId);
      }

      // Save the team room and userId on the socket instance.
      socket.teamId = teamId.toString();
      socket.userId = userId;

      socket.join(socket.teamId);
      console.log(`✅ User ${userId} joined team chat: ${socket.teamId}`);

      // Update the new room’s online users based on sockets present.
      updateRoomOnlineUsers(socket.teamId);
    });

    // --- Recruit Players Event ---
    socket.on("joinRecruitPlayers", async ({ userId }) => {
      if (!userId) {
        console.log("❌ Missing userId for recruit players");
        return;
      }
      // For recruit players, we use a global mapping.
      onlineRecruitUsers[userId] = socket.id;
      socket.userId = userId;
      socket.join("recruitPlayers");
      const allUsers = await User.find({}).select("name _id");
      const onlineUserIds = Object.keys(onlineRecruitUsers);
      io.to("recruitPlayers").emit("updateOnlineUsers", {
        allUsers,
        onlineUserIds,
      });
    });

    // --- Send Message Event ---
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

    // --- Disconnect Event ---
    socket.on("disconnect", async () => {
      console.log("🔌 User disconnected");

      // For team chat: update the room where the socket was.
      if (socket.teamId) {
        updateRoomOnlineUsers(socket.teamId);
      }

      // For recruit players, remove the user and update.
      if (socket.userId && onlineRecruitUsers[socket.userId]) {
        delete onlineRecruitUsers[socket.userId];
        const allUsers = await User.find({}).select("name _id");
        const onlineUserIds = Object.keys(onlineRecruitUsers);
        io.to("recruitPlayers").emit("updateOnlineUsers", {
          allUsers,
          onlineUserIds,
        });
      }
    });
  });
};
