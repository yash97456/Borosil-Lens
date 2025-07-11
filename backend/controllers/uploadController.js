const Upload = require("../models/Upload");

exports.uploadImage = async (req, res, next) => {
  const { sku, userId } = req.body;
  try {
    await Upload.saveUpload(req.file, sku, userId);
    res.json({ success: true, message: "Image uploaded", file: req.file, sku });
  } catch (err) {
    next(err);
  }
};
