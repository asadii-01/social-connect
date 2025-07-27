const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  const io = req.app.get("io");
  const { content, imageUrl } = req.body;
  console.log(req.body);
  let p = await Post.create({ author: req.userId, content, imageUrl });
  p = await p.populate("author", "username avatarUrl");
  io.to(req.userId).emit("newPost", p);
  res.status(201).json(p);
};

exports.getFeed = async (req, res) => {
  const me = await User.findById(req.userId);
  const ids = [...me.friends, req.userId];
  const posts = await Post.find({ author: { $in: ids } })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("author", "username avatarUrl")
    .lean();
  res.json(
    posts.map((p) => ({
      ...p,
      commentCount: p.commentCount || 0,
      likers: p.likers,
      currentUserId: req.userId,
    }))
  );
};

exports.getPostById = async (req, res) => {
  const p = await Post.findById(req.params.id)
    .populate("author", "username avatarUrl")
    .lean();
  const comments = await Comment.find({ post: p._id })
    .populate("author", "username")
    .lean();
  res.json({ ...p, comments, likers: p.likers, currentUserId: req.userId });
};

exports.toggleLike = async (req, res) => {
  const io = req.app.get("io");
  const p = await Post.findById(req.params.id);
  const i = p.likers.indexOf(req.userId);
  if (i === -1) p.likers.push(req.userId);
  else p.likers.splice(i, 1);
  await p.save();
  io.emit("newLike", {
    postId: p._id,
    likerId: req.userId,
  });
  res.json({ likers: p.likers });
};

exports.searchPosts = async (req, res) => {
  const q = req.query.q.trim();
  let posts = await Post.find({ $text: { $search: q } })
    .sort({ score: { $meta: "textScore" }, createdAt: -1 })
    .limit(50)
    .populate("author", "username avatarUrl")
    .lean();

  if (posts.length === 0) {
    const regex = new RegExp(q.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
    posts = await Post.find({ content: regex })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("author", "username avatarUrl")
      .lean();
  }

  res.json(
    posts.map((p) => ({
      ...p,
      commentCount: p.commentCount || 0,
      likers: p.likers,
      currentUserId: req.userId,
    }))
  );
};

exports.deletePost = async (req, res) => {
  const io = req.app.get("io");
  const p = await Post.findOneAndDelete({
    _id: req.params.id,
    author: req.userId,
  });
  if (!p)
    return res.status(404).json({ message: "Post not found or unauthorized" });
  io.to(req.userId).emit("postDeleted", { postId: req.params.id });
  res.status(200).json({ message: "Post deleted successfully" });
};

exports.editPost = async (req, res) => {
  const { content, imageUrl } = req.body;
  const p = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.userId },
    { content, imageUrl },
    { new: true }
  );
  if (!p)
    return res.status(404).json({ message: "Post not found or unauthorized" });
  res.json(p);
};
