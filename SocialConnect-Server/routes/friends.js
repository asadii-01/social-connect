const r = require("express").Router();
const { authenticate } = require("../middleware/auth");
const fc = require("../controllers/friendController");

r.post("/request", authenticate, fc.sendRequest);
r.get("/requests", authenticate, fc.getRequests);
r.get("/:id", authenticate, fc.getFriends);
r.post("/:requestId/accept", authenticate, fc.respondRequest);
r.post("/:requestId/reject", authenticate, fc.respondRequest);

module.exports = r;
