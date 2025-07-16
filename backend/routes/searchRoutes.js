const express = require("express");
const multer = require("multer");
const searchController = require("../controllers/searchController");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), searchController.searchImage);

module.exports = router;
