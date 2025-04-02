const Invite = require("./../models/inviteModel");

exports.getInvites = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
    }
    // Only return pending invites
    const invites = await Invite.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "name avatar");
    res.status(200).json({
      status: "success",
      data: invites,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createInvite = async (req, res) => {
  try {
    const { squadName, sender, receiver } = req.body;
    const newInvite = await Invite.create({ squadName, sender, receiver });
    res.status(201).json({
      status: "success",
      data: newInvite,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const updatedInvite = await Invite.findByIdAndUpdate(
      inviteId,
      { status: "accepted" },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedInvite,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.declineInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const updatedInvite = await Invite.findByIdAndUpdate(
      inviteId,
      { status: "declined" },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedInvite,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
