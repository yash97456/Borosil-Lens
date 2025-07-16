const axios = require("axios");
const { PY_API_BASE_URL } = require("../utils/config");

exports.getCodes = async (req, res) => {
  try {
    const pyRes = await fetch("http://127.0.0.1:8002/sku-list");
    const pyData = await pyRes.json();
    if (pyData.success && pyData.data && Array.isArray(pyData.data.skus)) {
      res.json({
        success: true,
        codes: pyData.data.skus.map((sku) => ({
          label: sku.sku_code,
          description: sku.description,
        })),
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Invalid codes response" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
