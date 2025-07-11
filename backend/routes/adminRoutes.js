const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/feedback/pending", adminController.getPendingFeedback);
router.post("/feedback/approve", adminController.approveFeedback);

module.exports = router;
