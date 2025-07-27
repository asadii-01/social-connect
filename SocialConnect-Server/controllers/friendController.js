const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

exports.sendRequest = async (req, res) => {
  const io = req.app.get("io");
  const { to } = req.body;

  if (await FriendRequest.findOne({ from: req.userId, to })) {
    return res.status(400).json({ message: "Already sent" });
  }
  let fr = await FriendRequest.create({ from: req.userId, to });
  fr = await fr.populate("from", "username");
  io.to(to.toString()).emit("friendRequest", fr);
  res.status(201).json(fr);
};

exports.getRequests = async (req, res) => {
  const arr = await FriendRequest.find({
    to: req.userId,
    status: "pending",
  }).populate("from", "username");
  res.json(arr);
};

exports.respondRequest = async (req, res) => {
  const { requestId } = req.params;
  const fr = await FriendRequest.findById(requestId);
  if (!fr || fr.to.toString() !== req.userId) {
    return res.status(404).json({ message: "Not found" });
  }
  fr.status = req.path.endsWith("accept") ? "accepted" : "rejected";
  await fr.save();
  if (fr.status === "accepted") {
    await User.findByIdAndUpdate(req.userId, { $push: { friends: fr.from } });
    await User.findByIdAndUpdate(fr.from, { $push: { friends: req.userId } });
  }
  res.json({ message: "Done" });
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .select("friends")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await User.find({
      _id: { $in: user.friends },
    })
      .select("username avatarUrl")
      .lean();
      
    return res.json(friends);
  } catch (err) {
    console.error("Error fetching friends:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
