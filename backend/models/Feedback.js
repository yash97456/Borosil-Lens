const bigquery = require("../utils/db");

exports.submitFeedback = async (image, suggestedCode, user) => {
  const query = `
    INSERT INTO \`your_dataset.feedback\` (image, suggestedCode, user, status, submittedAt)
    VALUES (@image, @suggestedCode, @user, 'pending', CURRENT_TIMESTAMP())
  `;
  const options = { query, params: { image, suggestedCode, user } };
  await bigquery.query(options);
};

exports.getPending = async () => {
  const query = `
    SELECT * FROM \`your_dataset.feedback\`
    WHERE status = 'pending'
    ORDER BY submittedAt DESC
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
};

exports.updateStatus = async (feedbackId, approve) => {
  const query = `
    UPDATE \`your_dataset.feedback\`
    SET status = @status
    WHERE id = @feedbackId
  `;
  const options = {
    query,
    params: { status: approve ? "approved" : "rejected", feedbackId },
  };
  await bigquery.query(options);
};
