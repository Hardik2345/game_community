const Message = require("./../models/messageModel");

// Fetch previous messages for a team
exports.getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const messages = await Message.find({ teamId }).populate("sender", "name");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};
