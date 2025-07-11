const bigquery = require("../utils/db");

exports.findByCredentials = async (userId, password) => {
  const query = `
    SELECT * FROM \`your_dataset.users\`
    WHERE userId = @userId AND password = @password
    LIMIT 1
  `;
  const options = {
    query,
    params: { userId, password },
  };
  const [rows] = await bigquery.query(options);
  return rows[0];
};

exports.getRole = async (userId) => {
  const query = `
    SELECT role FROM \`your_dataset.users\`
    WHERE userId = @userId
    LIMIT 1
  `;
  const options = { query, params: { userId } };
  const [rows] = await bigquery.query(options);
  return rows[0]?.role || "User";
};
