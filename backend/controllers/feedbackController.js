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

exports.getStats = async (req, res, next) => {
  try {
    const [codes] = await bigquery.query(
      "SELECT COUNT(DISTINCT sku) as totalCodes FROM `your_dataset.uploads`"
    );
    const [images] = await bigquery.query(
      "SELECT COUNT(*) as totalImages FROM `your_dataset.uploads`"
    );
    res.json({
      totalCodes: codes[0]?.totalCodes || 0,
      totalImages: images[0]?.totalImages || 0,
    });
  } catch (err) {
    next(err);
  }
};
