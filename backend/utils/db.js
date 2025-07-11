const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery({
  projectId: process.env.BQ_PROJECT_ID,
  keyFilename: process.env.BQ_KEY_FILE,
});

module.exports = bigquery;
