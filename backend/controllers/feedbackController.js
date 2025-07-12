const Feedback = require("../models/Feedback");
const bigquery = require("../utils/db");

exports.submitFeedback = async (req, res, next) => {
  const { image, suggestedCode, user } = req.body;
  try {
    await Feedback.submitFeedback(image, suggestedCode, user);
    res.json({ success: true, message: "Feedback submitted" });
  } catch (err) {
    next(err);
  }
};
