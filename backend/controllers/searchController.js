const bigquery = require("../utils/db");

exports.searchImage = async (req, res, next) => {
  try {
    const [rows] = await bigquery.query(
      "SELECT sku, name, 0.95 as confidence FROM `your_dataset.uploads` LIMIT 3"
    );
    res.json({
      success: true,
      results: rows.map((row) => ({
        sku: row.sku,
        name: row.name || "Spare Part",
        confidence: row.confidence,
      })),
    });
  } catch (err) {
    next(err);
  }
};
