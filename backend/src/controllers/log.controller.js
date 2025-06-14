const db = require('../config/db');


exports.getLogs = async (req, res) => {
  const { action, user_id, start_date, end_date, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const params = [];
  const whereClauses = [];

  if (action) {
    params.push(action);
    whereClauses.push(`action = $${params.length}`);
  }

  if (user_id) {
    params.push(user_id);
    whereClauses.push(`user_id = $${params.length}`);
  }

  if (start_date) {
    params.push(start_date);
    whereClauses.push(`created_at >= $${params.length}`);
  }

  if (end_date) {
    params.push(end_date);
    whereClauses.push(`created_at <= $${params.length}`);
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const logs = await db.query(
      `SELECT * FROM user_logs ${whereSQL} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({ logs: logs.rows });
  } catch (err) {
    console.error('Erreur lors de la récupération des logs:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
