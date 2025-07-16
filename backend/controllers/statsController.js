const axios = require("axios");
const { PY_API_BASE_URL } = require("../utils/config");

exports.getStats = async (req, res, next) => {
  try {
    const response = await axios.get(`${PY_API_BASE_URL}/dataset-stats`);
    if (response.data && response.data.success && response.data.data) {
      res.json({
        success: true,
        stats: response.data.data,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Invalid stats response" });
    }
  } catch (err) {
    next(err);
  }
};
