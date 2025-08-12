/* src/models/paiementsAbonnements.model.js */
const db          = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/* ------------------------------------------------------------- */
/* CRUD principal                                                */
/* ------------------------------------------------------------- */

/** ► Créer une ligne “paiement” AVANT redirection CinetPay */
async function create({ abonnement_id, montant, token }) {
  const id            = uuidv4();
  const transactionId = `TX-${Date.now()}`;     // identifiant mandaté par CinetPay
  const devise = body.devise || 'CDF';
  const { rows } = await db.query(
    `INSERT INTO paiements_abonnements (
        id, abonnement_id, montant,
        transaction_id, cinetpay_token, status
     ) VALUES ($1,$2,$3,$4,$5,$6, 'en_attente')
     RETURNING *`,
    [id, abonnement_id, montant, transactionId, token, devise]
  );
  return rows[0];
}

/** ► Mettre à jour après retour / webhook CinetPay */
async function updateStatus({ transaction_id, status, message }) {
  const { rows } = await db.query(
    `UPDATE paiements_abonnements
        SET status       = $1,
            message      = $2,
            date_paiement= NOW()
      WHERE transaction_id = $3
      RETURNING *`,
    [status, message, transaction_id]
  );
  return rows[0];
}

/* ------------------------------------------------------------- */
/* Lecture / listings                                             */
/* ------------------------------------------------------------- */
async function all() {
  const { rows } = await db.query(
    `SELECT p.*, a.organisation_nom, a.plan_tarifaire
       FROM paiements_abonnements p
            LEFT JOIN abonnements_dashboards a ON p.abonnement_id = a.id
      ORDER BY date_paiement DESC`);
  return rows;
}

async function byAbonnement(abonnement_id) {
  const { rows } = await db.query(
    `SELECT *
       FROM paiements_abonnements
      WHERE abonnement_id = $1
      ORDER BY date_paiement DESC`,
    [abonnement_id]
  );
  return rows;
}

async function byTransaction(transaction_id) {
  const { rows } = await db.query(
    `SELECT * FROM paiements_abonnements
      WHERE transaction_id = $1`,
    [transaction_id]
  );
  return rows[0];
}

module.exports = {
  create,
  updateStatus,
  all,
  byAbonnement,
  byTransaction,
};
