import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import { Pencil, Save, Lock } from "lucide-react";

export default function ProfilPage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ full_name: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name, email: user.email });
    }
  }, [user]);

  const handleUpdate = async () => {
  try {
    const res = await axiosInstance.put('/users/me', formData);
    // Mise à jour du contexte et du localStorage
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);

    setEditing(false);
    toast.success("Profil mis à jour avec succès !");
  } catch (err) {
    console.error("Erreur mise à jour :", err);
    toast.error("Erreur lors de la mise à jour du profil.");
  }
};


  const handleChangePassword = async () => {
    try {
      await axiosInstance.put('/users/update-password', passwordData);
      setPasswordData({ oldPassword: "", newPassword: "" });
      setShowPasswordForm(false);
      toast.success("🔒 Mot de passe mis à jour");
    } catch (err) {
      console.error("Erreur mot de passe :", err);
      toast.error("❌ Erreur changement mot de passe");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">👤 Mon profil</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nom complet</label>
          <input
            type="text"
            value={formData.full_name}
            disabled={!editing}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled={!editing}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="flex items-center gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
            >
              <Pencil className="mr-2" size={16} /> Modifier
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <Save className="mr-2" size={16} /> Sauvegarder
            </button>
          )}

          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Lock className="mr-2" size={16} /> Changer mot de passe
          </button>
        </div>
      </div>

      {showPasswordForm && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🔒 Mise à jour du mot de passe</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              ✅ Enregistrer le nouveau mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
