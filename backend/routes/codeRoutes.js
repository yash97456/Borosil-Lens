const express = require("express");
const router = express.Router();
const codeController = require("../controllers/codeController");

router.get("/", codeController.getCodes);

module.exports = router;
