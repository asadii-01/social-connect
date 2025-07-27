const User = require("../models/User");
const Post = require("../models/Post");

exports.getMe = async (req, res) => {
  const u = await User.findById(req.userId).select("-password");
  res.json(u);
};

exports.getUserByUsername = async (req, res) => {
  const u = await User.findOne({ username: req.params.username }).select(
    "-password"
  );
  if (!u) return res.status(404).json({ message: "Not found" });
  const posts = await Post.find({ author: u._id })
    .sort({ createdAt: -1 })
    .populate("author", "username avatarUrl")
    .lean();
  const isMe = u._id.toString() === req.userId;
  res.json({
    user: { ...u, isMe },
    posts: posts.map((p) => ({
      ...p,
      commentCount: p.commentCount || 0,
      likers: p.likers,
      currentUserId: req.userId,
    })),
  });
};

exports.updateUser = async (req, res) => {
  const data = { ...req.body };
  const u = await User.findByIdAndUpdate(req.userId, data, {
    new: true,
  }).select("-password");
  res.json(u);
};

exports.searchUsers = async (req, res) => {
  const q = req.query.q.trim();
  let users = await User.find({ $text: { $search: req.query.q } })
    .limit(20)
    .select("username name avatarUrl");

  if (users.length === 0) {
    const regex = new RegExp(q.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
    users = await User.find({ content: regex })
      .limit(20)
      .select("username name avatarUrl");
  }

  res.json(users);
};
