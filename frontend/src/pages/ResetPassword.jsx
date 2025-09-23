// src/pages/ResetPassword.jsx
import { useState } from "react";
import axiosInstance from "../api/axiosInstance.js";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      await axiosInstance.post("/users/reset-password", { email });
      setSuccess("✅ Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Une erreur est survenue.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center text-green-600">
          Réinitialisation du mot de passe
        </h2>

        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleReset}>
          <label className="block mb-2 text-gray-700">Adresse e-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
