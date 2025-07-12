const { bigquery } = require("../config/bigquery");

exports.getStats = async (req, res, next) => {
  try {
    const [codes] = await bigquery.query(
      "SELECT COUNT(DISTINCT sku) as totalCodes FROM `your_dataset.uploads`"
    );
    const [images] = await bigquery.query(
      "SELECT COUNT(*) as totalImages FROM `your_dataset.uploads`"
    );
    res.json({
      success: true,
      stats: {
        totalCodes: codes[0]?.totalCodes || 0,
        totalImages: images[0]?.totalImages || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
