const express = require("express");
const multer = require("multer");
const feedbackController = require("../controllers/feedbackController");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), feedbackController.submitFeedback);
router.get("/pending", feedbackController.getPendingFeedback);

module.exports = router;
