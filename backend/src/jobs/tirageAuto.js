const cron = require('node-cron');
const db = require('../config/db');
const Notification = require('../models/notifications.model');
const Badge = require('../models/badges.model');

const lancerTiragesAutomatiques = async () => {
  const client = await db.connect();
  try {
    const tiragesACloturer = await client.query(`
      SELECT t.*
      FROM tirages t
      WHERE t.date_fin <= NOW()
      AND t.actif = true
      AND NOT EXISTS (
        SELECT 1 FROM tirages_resultats r WHERE r.tirage_id = t.id
      )
    `);

    for (const tirage of tiragesACloturer.rows) {
      const participantsRes = await client.query(
        `SELECT user_id FROM tirages_participants WHERE tirage_id = $1`,
        [tirage.id]
      );

      const participants = participantsRes.rows;
      if (participants.length === 0) continue; // Aucun gagnant possible

      const gagnant = participants[Math.floor(Math.random() * participants.length)];

      // Insérer dans tirages_resultats
      await client.query(`
        INSERT INTO tirages_resultats (id, tirage_id, user_gagnant_id, date_tirage, recompense)
        VALUES (gen_random_uuid(), $1, $2, NOW(), $3)
      `, [tirage.id, gagnant.user_id, `Récompense du tirage: ${tirage.titre}`]);

      // Notification
      await Notification.createNotification({
        user_id: gagnant.user_id,
        titre: "🎉 Tirage au sort gagné !",
        message: `Bravo ! Vous avez remporté le tirage "${tirage.titre}"`,
        type: "succès",
        lien_action: "/tirages/me"
      });

      // Badge
      const badgeRes = await client.query(
        `SELECT id FROM badges WHERE condition_type = 'tirage_gagne' AND condition_value = '1' LIMIT 1`
      );
      if (badgeRes.rows.length > 0) {
        await Badge.attribuerBadge(gagnant.user_id, badgeRes.rows[0].id);

        await Notification.createNotification({
          user_id: gagnant.user_id,
          titre: "🏅 Nouveau badge débloqué",
          message: `Vous avez débloqué le badge "Gagnant de tirage"`,
          type: "succès",
          lien_action: "/badges/me"
        });
      }
    }

  } catch (error) {
    console.error("Erreur tirage auto :", error);
  } finally {
    client.release();
  }
};

// Planification toutes les minutes
cron.schedule('* * * * *', () => {
  console.log("🕐 Vérification des tirages à exécuter...");
  lancerTiragesAutomatiques();
});
