// src/pages/ResetPasswordForm.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirm) {
      setError("❌ Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await axiosInstance.post("/users/update-password", {
        token,
        newPassword,
      });

      setMessage("✅ Mot de passe mis à jour. Redirection...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-green-600 mb-4">
          Définir un nouveau mot de passe
        </h2>

        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              className="w-full border px-4 py-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Confirmer</label>
            <input
              type="password"
              required
              className="w-full border px-4 py-2 rounded"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            Mettre à jour
          </button>
        </form>
      </div>
    </div>
  );
}
