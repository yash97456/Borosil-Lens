const User = require("../models/User");
const Feedback = require("../models/Feedback");
const axios = require("axios");
const { PY_API_BASE_URL } = require("../utils/config");

exports.getPendingFeedback = async (req, res, next) => {
  try {
    const response = await axios.get(`${PY_API_BASE_URL}/pending-feedback`, {
      auth: {
        username: "admin",
        password: "admin123",
      },
    });
    if (
      response.data &&
      response.data.success &&
      response.data.data &&
      Array.isArray(response.data.data.feedback_list)
    ) {
      res.json({ feedbacks: response.data.data.feedback_list });
    } else {
      res
        .status(500)
        .json({ feedbacks: [], message: "Failed to fetch pending feedbacks" });
    }
  } catch (err) {
    next(err);
  }
};

exports.approveFeedback = async (req, res, next) => {
  try {
    const { feedbackId, approve, adminName } = req.body;
    if (approve) {
      const response = await axios.post(
        `${PY_API_BASE_URL}/approve-feedback`,
        {
          feedback_id: feedbackId,
          admin_name: adminName || "admin",
        },
        {
          auth: {
            username: "admin",
            password: "admin123",
          },
        }
      );
      res.json(response.data);
    } else {
      await Feedback.updateStatus(feedbackId, "rejected", adminName || "admin");
      res.json({
        success: true,
        message: "Feedback rejected",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, password, role_id } = req.body;
    await User.createUser(username, password, role_id);
    res.json({ success: true, message: "User created" });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id, password, role_id } = req.body;
    await User.updateUser(id, password, role_id);
    res.json({ success: true, message: "User updated" });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.deleteUser(id);
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
