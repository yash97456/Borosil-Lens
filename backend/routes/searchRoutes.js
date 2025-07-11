const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), searchController.searchImage);

module.exports = router;
