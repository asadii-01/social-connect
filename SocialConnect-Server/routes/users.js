const r = require("express").Router();
const { authenticate } = require("../middleware/auth");
const uc = require("../controllers/userController");

r.get("/me", authenticate, uc.getMe);
r.get("/search", authenticate, uc.searchUsers);
r.get("/:username", authenticate, uc.getUserByUsername);
r.put("/:username", authenticate, uc.updateUser);

module.exports = r;
