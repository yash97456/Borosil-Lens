exports.searchImage = async (req, res, next) => {
  try {
    res.json({
      results: [
        // { sku: 'SP-1001', confidence: 0.97 },
        // { sku: 'SP-1002', confidence: 0.89 },
        // { sku: 'SP-1003', confidence: 0.81 }
      ],
    });
  } catch (err) {
    next(err);
  }
};
