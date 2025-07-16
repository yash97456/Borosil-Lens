const bigquery = require("../utils/db");

exports.saveUpload = async (file, sku_code, uploaded_by) => {
  const query = `
    INSERT INTO \`borosil_lens.sku_images\`
    (id, sku_code, image_name, image_data, file_size, width, height, processed_at, clip_features, uploaded_by)
    VALUES (GENERATE_UUID(), @sku_code, @image_name, @image_data, @file_size, @width, @height, CURRENT_TIMESTAMP(), @clip_features, @uploaded_by)
  `;
  const options = {
    query,
    params: {
      sku_code,
      image_name: file.filename,
      image_data: file.path,
      file_size: file.size,
      width: file.width || 0,
      height: file.height || 0,
      clip_features: [],
      uploaded_by,
    },
  };
  await bigquery.query(options);
};
