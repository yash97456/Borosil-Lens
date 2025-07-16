const bigquery = require("../utils/db");

exports.submitFeedback = async (
  image_features,
  predicted_sku,
  correct_sku,
  username
) => {
  const query = `
    INSERT INTO \`borosil_lens.user_feedback\`
    (feedback_id, username, predicted_sku, correct_sku, image_features, complaint_time, status)
    VALUES (GENERATE_UUID(), @username, @predicted_sku, @correct_sku, @image_features, CURRENT_TIMESTAMP(), 'pending')
  `;
  const options = {
    query,
    params: {
      username,
      predicted_sku,
      correct_sku,
      image_features,
    },
  };
  await bigquery.query(options);
};

exports.getPending = async () => {
  const query = `
    SELECT * FROM \`borosil_lens.user_feedback\`
    WHERE status = 'pending'
    ORDER BY complaint_time DESC
  `;
  const [rows] = await bigquery.query({ query });
  return rows;
};

exports.updateStatus = async (feedbackId, status, admin_name) => {
  const query = `
    UPDATE \`borosil_lens.user_feedback\`
    SET status = @status, admin_name = @admin_name, approval_time = CURRENT_TIMESTAMP()
    WHERE feedback_id = @feedbackId
  `;
  const options = {
    query,
    params: { status, admin_name, feedbackId },
  };
  await bigquery.query(options);
};
