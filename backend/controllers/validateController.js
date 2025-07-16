const axios = require("axios");
const { PY_API_BASE_URL } = require("../utils/config");

exports.validateSku = async (req, res, next) => {
  try {
    const response = await axios.post(`${PY_API_BASE_URL}/validate-sku`, {
      sku_code: req.body.sku_code,
    });
    res.json(response.data);
  } catch (err) {
    next(err);
  }
};
