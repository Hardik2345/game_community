const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");
const Team = require("./../models/teamModel");

exports.getAllTeams = factory.getAll(Team);
exports.getTeam = factory.getOne(Team);
exports.createTeam = factory.createOne(Team);
exports.updateTeam = factory.updateOne(Team);
exports.deleteTeam = factory.deleteOne(Team);

exports.addMemberToTeam = catchAsync(async (req, res, next) => {
  const { teamId, memberId } = req.body;

  // Update the team document by adding the member (using $addToSet to avoid duplicates)
  const team = await Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: memberId } },
    { new: true, runValidators: true }
  );

  if (!team) {
    return next(new AppError("No team found with that ID", 404));
  }

  // Update the user document by adding the team ID to the user's team array
  await User.findByIdAndUpdate(memberId, { $addToSet: { team: team._id } });

  res.status(200).json({
    status: "success",
    data: { team },
  });
});
