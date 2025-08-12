/* src/controllers/paiementsAbonnements.controller.js */
const axios     = require('axios');
const Paiement  = require('../models/paiementsAbonnements.model');

const {
  CINETPAY_API_KEY,
  CINETPAY_SITE_ID,
  CINETPAY_RETURN_URL,
  CINETPAY_SECRET_KEY = '',          // v2 : clé privée optionnelle
} = process.env;

const CINETPAY_BASE = 'https://api-checkout.cinetpay.com/v2';

/* ------------------------------------------------------------- */
/* 1. Init – lance la transaction et renvoie payment_url          */
/* ------------------------------------------------------------- */
exports.initPaiement = async (req, res) => {
  try {
    const { abonnement_id, montant } = req.body;

    // 1️⃣ Enregistrer localement
    const token    = 'tok_' + Math.random().toString(36).slice(2);
    const payment  = await Paiement.create({ abonnement_id, montant, token });

    // 2️⃣ Appel CinetPay
    const { data } = await axios.post(`${CINETPAY_BASE}/payment`, {
      apikey         : CINETPAY_API_KEY,
      site_id        : CINETPAY_SITE_ID,
      secret_key     : CINETPAY_SECRET_KEY,
      transaction_id : payment.transaction_id,
      amount         : montant,
      currency       : 'CDF',
      description    : 'Paiement abonnement RecyTech',
      return_url     : CINETPAY_RETURN_URL,
      notify_url     : CINETPAY_RETURN_URL,
      channels       : 'ALL',
    });

    if (data.code !== '201')
      return res.status(400).json({ message: 'Erreur API CinetPay', data });

    res.json({
      redirect_url   : data.data.payment_url,
      transaction_id : payment.transaction_id,
    });
  } catch (err) {
    console.error('[Paiement] init error:', err.response?.data || err);
    res.status(500).json({ message: 'Erreur lors de l’initiation du paiement' });
  }
};

/* ------------------------------------------------------------- */
/* 2. Callback / Notify – CinetPay renvoie transaction_id         */
/* ------------------------------------------------------------- */
exports.handleCallback = async (req, res) => {
  try {
    const transaction_id = req.body.transaction_id || req.query.transaction_id;

    // ▶️ Re‑vérification
    const { data } = await axios.post(`${CINETPAY_BASE}/payment/check`, {
      apikey         : CINETPAY_API_KEY,
      site_id        : CINETPAY_SITE_ID,
      transaction_id,
    });

    const statusCinet = data.data.status;             // ACCEPTED / REFUSED …
    const newStatus   = statusCinet === 'ACCEPTED' ? 'valide' : 'échoué';

    const updated = await Paiement.updateStatus({
      transaction_id,
      status  : newStatus,
      message : data.message || statusCinet,
    });

    res.json({ message: 'Statut mis à jour', updated });
  } catch (err) {
    console.error('[Paiement] callback error:', err.response?.data || err);
    res.status(500).json({ message: 'Erreur callback' });
  }
};

/* ------------------------------------------------------------- */
/* 3. Lecture (admin ou propriétaire)                             */
/* ------------------------------------------------------------- */
exports.all          = async (_req, res)       => res.json(await Paiement.all());
exports.byAbonnement = async (req,  res)       =>
  res.json(await Paiement.byAbonnement(req.params.abonnement_id));

exports.byTx         = async (req,  res) => {
  const p = await Paiement.byTransaction(req.params.transaction_id);
  return p ? res.json(p) : res.status(404).json({ message: 'Paiement introuvable' });
};
