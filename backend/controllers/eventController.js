const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const Event = require("./../models/eventModel");
const User = require("./../models/userModel");
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
  if (!req.files || !req.files.imageCover) return next();
  if (!req.files.imageCover) return next();

  // 1) Cover image
  const filename = `event-${Date.now()}-cover.jpeg`;
  req.body.imageCover = filename;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/events/${req.body.imageCover}`);

  next();
});

exports.addMemberToEvent = catchAsync(async (req, res, next) => {
  const { gameId, members } = req.body;

  if (!gameId || !members) {
    return next(new AppError("Please provide both gameId and members", 400));
  }

  // Add member(s) to the event (team)
  const team = await Event.findByIdAndUpdate(
    gameId,
    {
      $addToSet: {
        members: { $each: Array.isArray(members) ? members : [members] },
      },
    },
    { new: true, runValidators: true }
  );

  if (!team) {
    return next(new AppError("No team found with that ID", 404));
  }

  // Add the team ID to each user's `team` field
  const memberIds = Array.isArray(members) ? members : [members];

  await Promise.all(
    memberIds.map((memberId) =>
      User.findByIdAndUpdate(memberId, { $addToSet: { event: team._id } })
    )
  );

  res.status(200).json({
    status: "success",
    data: { event: team },
  });
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Fetch the event
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  // 2) Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/`,
    client_reference_id: req.params.eventId,
    metadata: { userId: req.user.id },
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: event.price * 100, // Stripe expects cents
          product_data: {
            name: event.name,
            description: event.description,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment", // ensure you set mode
    success_url: `http://localhost:5173/events`,
    cancel_url: `http://localhost:5173/events`,
  });

  // 3) Return session URL
  res.status(200).json({
    status: "success",
    sessionId: session.id,
    checkoutUrl: session.url, // v9+ provides `.url`
  });
});
exports.getAllEvents = factory.getAll(Event);
exports.getEvent = factory.getOne(Event);
exports.createEvent = factory.createOne(Event);
exports.updateEvent = factory.updateOne(Event);
exports.deleteEvent = factory.deleteOne(Event);
