const r = require("express").Router();
const { authenticate } = require("../middleware/auth");
const pc = require("../controllers/postController");
const cc = require("../controllers/commentController");

r.post("/", authenticate, pc.createPost);
r.get("/feed", authenticate, pc.getFeed);
r.get("/search", authenticate, pc.searchPosts);
r.get("/:id", authenticate, pc.getPostById);
r.get("/:id/comments", authenticate, cc.getComments);
r.post("/:id/like", authenticate, pc.toggleLike);
r.post("/:id/comments", authenticate, cc.addComment);
r.put("/:id", authenticate, pc.editPost);
r.delete("/:id/comments/:commentId", authenticate, cc.deleteComment);
r.delete("/:id", authenticate, pc.deletePost);

module.exports = r;
