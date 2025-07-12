const User = require("../models/User");
const Feedback = require("../models/Feedback");

exports.getPendingFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.getPending();
    res.json({ feedbacks });
  } catch (err) {
    next(err);
  }
};

exports.approveFeedback = async (req, res, next) => {
  try {
    const { feedbackId, approve } = req.body;
    await Feedback.updateStatus(feedbackId, approve ? "approved" : "rejected");
    res.json({
      success: true,
      message: `Feedback ${approve ? "approved" : "rejected"}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { userId, password, role } = req.body;
    await User.createUser(userId, password, role);
    res.json({ success: true, message: "User created" });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { userId, password, role } = req.body;
    await User.updateUser(userId, password, role);
    res.json({ success: true, message: "User updated" });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.deleteUser(userId);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { userId, oldPwd, newPwd } = req.body;
    const changed = await User.changePassword(userId, oldPwd, newPwd);
    if (changed) {
      res.json({ success: true, message: "Password changed" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Old password incorrect" });
    }
  } catch (err) {
    next(err);
  }
};
