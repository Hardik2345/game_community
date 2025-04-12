const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const Event = require("./../models/eventModel");
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEventImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
]);

exports.resizeEventImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  next();
});

exports.addMemberToEvent = catchAsync(async (req, res, next) => {
  const { gameId, memberId } = req.body;

  // Update the team document by adding the member (using $addToSet to avoid duplicates)
  const team = await Event.findByIdAndUpdate(
    gameId,
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

exports.getAllEvents = factory.getAll(Event);
exports.getEvent = factory.getOne(Event);
exports.createEvent = factory.createOne(Event);
exports.updateEvent = factory.updateOne(Event);
exports.deleteEvent = factory.deleteOne(Event);
