const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/feedback/pending", adminController.getPendingFeedback);
router.post("/feedback/approve", adminController.approveFeedback);

router.post("/user", adminController.createUser);
router.put("/user", adminController.updateUser);
router.delete("/user/:userId", adminController.deleteUser);
router.get("/users", adminController.getUsers);

router.post("/change-password", adminController.changePassword);

module.exports = router;
