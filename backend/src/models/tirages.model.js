/* eslint-disable camelcase */
const db        = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/* ───────────────────────── CRUD TIRAGES ───────────────────────── */

/** Création (Admin) */
async function create({ titre, description, type = 'standard',
                        points_participation = 0, date_debut, date_fin }) {
  const id = uuidv4();
  const { rows } = await db.query(
    `INSERT INTO tirages
       (id, titre, description, type, points_participation,
        date_debut, date_fin, actif)
     VALUES ($1,$2,$3,$4,$5,$6,$7, true)
     RETURNING *`,
    [id, titre, description, type, points_participation, date_debut, date_fin]
  );
  return rows[0];
}

/** Liste paginée / filtrée (Admin) */
async function list({ page = 1, limit = 10, q = '', actif = 'all' }) {
  const off   = (page - 1) * limit;
  const conds = [];
  const vals  = [];

  if (q) {
    vals.push(`%${q}%`);
    conds.push(`(titre ILIKE $${vals.length} OR description ILIKE $${vals.length})`);
  }
  if (actif !== 'all') {
    vals.push(actif === 'true');
    conds.push(`actif = $${vals.length}`);
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const list = await db.query(
    `SELECT * FROM tirages
      ${where}
      ORDER BY date_debut DESC
      LIMIT  $${vals.length + 1}
      OFFSET $${vals.length + 2}`,
    [...vals, limit, off]
  );

  const { rows: [{ count }] } = await db.query(
    `SELECT COUNT(*)::int AS count FROM tirages ${where}`,
    vals
  );

  return { rows: list.rows, total: count };
}

/** Activer / désactiver */
async function toggle(id, actif) {
  const { rows } = await db.query(
    `UPDATE tirages SET actif = $1 WHERE id = $2 RETURNING id, actif`,
    [actif, id]
  );
  return rows[0];
}

/* ───────────────────── PARTICIPATION UTILISATEUR ─────────────── */

async function hasParticipated(tirage_id, user_id) {
  const { rows } = await db.query(
    `SELECT 1 FROM tirages_participants
      WHERE tirage_id = $1 AND user_id = $2`,
    [tirage_id, user_id]
  );
  return rows.length > 0;
}

async function participate(tirage, user) {
  // 1. vérif solde
  if (user.points < tirage.points_participation) {
    throw new Error("Solde de points insuffisant");
  }

  // 2. déduire les points + enregistrer participation (transaction)
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE users SET points = points - $1 WHERE id = $2`,
      [tirage.points_participation, user.id]
    );
    await client.query(
      `INSERT INTO tirages_participants (id, tirage_id, user_id)
       VALUES ($1,$2,$3)`,
      [uuidv4(), tirage.id, user.id]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/* ───────────────────── TIRAGE AU SORT (Admin) ─────────────────── */

async function drawWinner(tirage_id) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // lock row
    const { rows: [tirage] } = await client.query(
      `SELECT * FROM tirages WHERE id = $1 FOR UPDATE`,
      [tirage_id]
    );
    if (!tirage) throw new Error('Tirage introuvable');
    if (tirage.gagnant_id) throw new Error('Déjà tiré');

    const { rows: participants } = await client.query(
      `SELECT user_id FROM tirages_participants
        WHERE tirage_id = $1`,
      [tirage_id]
    );
    if (!participants.length) throw new Error('Aucun participant');

    const gagnant = participants[Math.floor(Math.random() * participants.length)].user_id;

    await client.query(
      `UPDATE tirages SET gagnant_id = $1 WHERE id = $2`,
      [gagnant, tirage_id]
    );

    await client.query('COMMIT');
    return gagnant;

  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/* ───────────────────────── EXPORTS ───────────────────────────── */
module.exports = {
  create,
  list,
  toggle,
  hasParticipated,
  participate,
  drawWinner
};
