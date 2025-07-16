const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), uploadController.uploadImage);
module.exports = router;
