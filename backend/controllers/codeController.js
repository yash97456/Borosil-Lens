const bigquery = require("../utils/db");

exports.getCodes = async (req, res, next) => {
  try {
    const [rows] = await bigquery.query(
      "SELECT DISTINCT sku FROM `your_dataset.uploads` ORDER BY sku"
    );
    res.json({
      success: true,
      codes: rows.map((row) => ({ label: row.sku })),
    });
  } catch (err) {
    next(err);
  }
};
