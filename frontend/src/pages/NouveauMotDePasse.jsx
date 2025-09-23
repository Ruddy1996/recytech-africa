// src/pages/NouveauMotDePasse.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance.js";

export default function NouveauMotDePasse() {
  const [params] = useSearchParams();
  const token = params.get("token"); // récupère ?token=xxx dans l'URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirm) {
      return setMessage("❌ Les mots de passe ne correspondent pas.");
    }

    try {
      await axiosInstance.put("/users/update-password-token", {
        token,       // ⚡ on envoie bien le token ici
        newPassword,
      });

      setMessage("✅ Mot de passe réinitialisé avec succès !");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600">
          Nouveau mot de passe
        </h1>

        {message && (
          <p
            className={`text-center text-sm mb-4 ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="w-full border px-4 py-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="w-full border px-4 py-2 rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Réinitialiser
          </button>
        </form>
      </div>
    </div>
  );
}
