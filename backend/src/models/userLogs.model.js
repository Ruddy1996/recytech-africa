const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const UserLogs = {
  async log(user_id, action, metadata = {}) {
    await db.query(
      `INSERT INTO user_logs (id, user_id, action, metadata)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), user_id, action, metadata]
    );
  }
};

module.exports = UserLogs;
