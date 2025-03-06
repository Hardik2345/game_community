const Message = require("./../models/messageModel");

// Fetch previous messages for a team
exports.getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Fetch encrypted messages
    const messages = await Message.find({ teamId }).populate("sender", "name");

    // Decrypt messages

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
};
