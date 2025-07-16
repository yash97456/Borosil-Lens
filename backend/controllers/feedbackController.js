const axios = require("axios");
const FormData = require("form-data");
const { PY_API_BASE_URL } = require("../utils/config");

exports.submitFeedback = async (req, res, next) => {
  try {
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);
    form.append("username", req.body.username);
    form.append("predicted_sku", req.body.predicted_sku);
    form.append("correct_sku", req.body.correct_sku);
    const response = await axios.post(
      `${PY_API_BASE_URL}/submit-feedback`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    res.json(response.data);
  } catch (err) {
    next(err);
  }
};
exports.getPendingFeedback = async (req, res, next) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8002/pending-feedback`);
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
