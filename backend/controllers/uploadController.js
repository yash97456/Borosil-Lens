const axios = require("axios");
const FormData = require("form-data");
const { PY_API_BASE_URL } = require("../utils/config");

exports.uploadImage = async (req, res, next) => {
  try {
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);
    form.append("sku_code", req.body.sku_code);
    form.append("username", req.body.username);

    const response = await axios.post(`${PY_API_BASE_URL}/upload-image`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.json(response.data);
  } catch (err) {
    next(err);
  }
};
