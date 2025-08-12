INSERT INTO plans_tarifaires (id, nom, description, prix_mensuel, nb_utilisateurs, acces_data, acces_alertes, acces_export)
VALUES
  (gen_random_uuid(), 'basic', 'Accès aux dashboards de base', 10000, 2, true, false, false),
  (gen_random_uuid(), 'pro', 'Accès data + alertes en temps réel', 25000, 5, true, true, false),
  (gen_random_uuid(), 'premium', 'Accès complet avec export de données', 50000, 10, true, true, true)
ON CONFLICT (nom) DO NOTHING;
