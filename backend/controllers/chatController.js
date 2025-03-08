const Message = require("./../models/messageModel");
const { decrypt } = require("./../utils/encryption");

// Fetch previous messages for a team
exports.getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Fetch encrypted messages
    let messages = await Message.find({ teamId }).populate("sender", "name");

    // Decrypt messages
    messages = messages.map((msg) => ({
      ...msg._doc,
      content: decrypt(msg.content, msg.iv), // Decrypt message before sending
    }));

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
};
