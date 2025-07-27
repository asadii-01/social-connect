const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async (req, res) => {
  const io = req.app.get("io");
  const { content } = req.body;
  let c = await Comment.create({
    post: req.params.id,
    author: req.userId,
    content,
  });
  c = await c.populate("author", "username");
  const post = await Post.findById(req.params.id);
  io.to(post.author.toString()).emit("newComment", {
    postId: post._id,
    comment: c,
  });
  res.status(201).json(c);
};

exports.getComments = async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate("author", "username")
    .lean();
  res.json(comments);
};

exports.deleteComment = async (req, res) => {
  const io = req.app.get("io");
  const { id: postId, commentId } = req.params;

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    post: postId,
    author: req.userId,
  });
  if (!comment) {
    return res
      .status(404)
      .json({ message: "Comment not found or unauthorized" });
  }

  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

  io.to(req.userId).emit("commentDeleted", { postId, commentId });

  res.json({ commentId });
};
