const bigquery = require("../utils/db");
const bcrypt = require("bcryptjs");

exports.createUser = async (userId, password, role) => {
  const hashed = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO \`your_dataset.users\` (userId, password, role)
    VALUES (@userId, @password, @role)
  `;
  const options = {
    query,
    params: { userId, password: hashed, role },
  };
  await bigquery.query(options);
};

exports.updateUser = async (userId, password, role) => {
  let setClause = [];
  let params = { userId };
  if (password) {
    setClause.push("password = @password");
    params.password = await bcrypt.hash(password, 10);
  }
  if (role) {
    setClause.push("role = @role");
    params.role = role;
  }
  if (!setClause.length) return;
  const query = `
    UPDATE \`your_dataset.users\`
    SET ${setClause.join(", ")}
    WHERE userId = @userId
  `;
  await bigquery.query({ query, params });
};

exports.deleteUser = async (userId) => {
  const query = `
    DELETE FROM \`your_dataset.users\`
    WHERE userId = @userId
  `;
  await bigquery.query({ query, params: { userId } });
};

exports.getAllUsers = async () => {
  const query = `
    SELECT userId, role FROM \`your_dataset.users\`
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
};

exports.changePassword = async (userId, oldPwd, newPwd) => {
  const query = `
    SELECT password FROM \`your_dataset.users\`
    WHERE userId = @userId
  `;
  const [rows] = await bigquery.query({ query, params: { userId } });
  if (!rows.length) return false;
  const valid = await bcrypt.compare(oldPwd, rows[0].password);
  if (!valid) return false;
  const hashed = await bcrypt.hash(newPwd, 10);
  const updateQuery = `
    UPDATE \`your_dataset.users\`
    SET password = @password
    WHERE userId = @userId
  `;
  await bigquery.query({
    query: updateQuery,
    params: { userId, password: hashed },
  });
  return true;
};
