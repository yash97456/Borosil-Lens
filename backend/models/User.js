const bigquery = require("../utils/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const USER_TABLE = "`borosil_lens.users`";
const ROLE_TABLE = "`borosil_lens.roles`";

exports.createUser = async (username, password, role_id) => {
  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const query = `
    INSERT INTO ${USER_TABLE} (id, username, password, role_id)
    VALUES (@id, @username, @password, @role_id)
  `;
  await bigquery.query({
    query,
    params: { id, username, password: hashed, role_id },
  });
};

exports.updateUser = async (id, password, role_id) => {
  let setClause = [];
  let params = { id };
  if (password && password.trim() !== "") {
    setClause.push("password = @password");
    params.password = await bcrypt.hash(password, 10);
  }
  if (role_id) {
    setClause.push("role_id = @role_id");
    params.role_id = role_id;
  }
  if (!setClause.length) return;
  const query = `
    UPDATE ${USER_TABLE}
    SET ${setClause.join(", ")}
    WHERE id = @id
  `;
  await bigquery.query({ query, params });
};

exports.deleteUser = async (id) => {
  const query = `
    DELETE FROM ${USER_TABLE}
    WHERE id = @id
  `;
  await bigquery.query({ query, params: { id } });
};

exports.getAllUsers = async () => {
  const query = `
    SELECT u.id, u.username, r.role
    FROM ${USER_TABLE} u
    JOIN ${ROLE_TABLE} r ON u.role_id = CAST(r.id AS INT64)
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
};

exports.changePassword = async (id, oldPwd, newPwd) => {
  const query = `
    SELECT password FROM ${USER_TABLE}
    WHERE id = @id
  `;
  const [rows] = await bigquery.query({ query, params: { id } });
  if (!rows.length) return false;
  const valid = await bcrypt.compare(oldPwd, rows[0].password);
  if (!valid) return false;
  const hashed = await bcrypt.hash(newPwd, 10);
  const updateQuery = `
    UPDATE ${USER_TABLE}
    SET password = @password
    WHERE id = @id
  `;
  await bigquery.query({
    query: updateQuery,
    params: { id, password: hashed },
  });
  return true;
};

exports.findByCredentials = async (username, password) => {
  const query = `
    SELECT u.*, r.role
    FROM \`borosil_lens.users\` u
    JOIN \`borosil_lens.roles\` r ON u.role_id = CAST(r.id AS INT64)
    WHERE u.username = @username
    LIMIT 1
  `;
  const [rows] = await bigquery.query({ query, params: { username } });
  if (!rows.length) return null;
  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  return user;
};
