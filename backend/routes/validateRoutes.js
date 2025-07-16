const express = require("express");
const validateController = require("../controllers/validateController");
const router = express.Router();

router.post("/", validateController.validateSku);

module.exports = router;
