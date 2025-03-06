const Message = require("./../models/messageModel");
const encryption = require("./../utils/encryption");

// Fetch previous messages for a team
exports.getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const messages = await Message.find({ teamId }).populate("sender", "name");
    const decryptedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      content: encryption.decryptMessage(msg.content),
    }));

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};
