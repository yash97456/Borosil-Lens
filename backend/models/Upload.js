const bigquery = require("../utils/db");

exports.saveUpload = async (file, sku, userId) => {
  const query = `
    INSERT INTO \`your_dataset.uploads\` (filename, sku, userId, uploadedAt)
    VALUES (@filename, @sku, @userId, CURRENT_TIMESTAMP())
  `;
  const options = {
    query,
    params: { filename: file.filename, sku, userId },
  };
  await bigquery.query(options);
};
