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
  const { feedbackId, approve } = req.body;
  try {
    await Feedback.updateStatus(feedbackId, approve);
    res.json({ success: true, message: approve ? "Approved" : "Rejected" });
  } catch (err) {
    next(err);
  }
};
