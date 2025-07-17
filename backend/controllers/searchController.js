const axios = require("axios");
const FormData = require("form-data");
const { PY_API_BASE_URL } = require("../utils/config");

exports.searchImage = async (req, res, next) => {
  try {
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      `${PY_API_BASE_URL}/search-similar`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (
      response.data &&
      response.data.success &&
      response.data.data &&
      Array.isArray(response.data.data.matches)
    ) {
      res.json({
        success: true,
        results: response.data.data.matches,
        message: response.data.message,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Invalid search response" });
    }
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
