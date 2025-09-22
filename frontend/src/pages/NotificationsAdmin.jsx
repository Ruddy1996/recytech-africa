// src/pages/NotificationsAdmin.jsx
import { useEffect, useState } from "react";
import io from "socket.io-client";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCircle,
  Circle,
  Filter,
  Search,
  Mail
} from "lucide-react";

import axiosInstance from "../api/axiosInstance"; // ✅ on utilise axiosInstance

export default function NotificationsAdmin() {
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    lu: "all",
    type: "all",
    q: ""
  });

  /* ─────────── chargement initial ─────────── */
  useEffect(() => {
    loadNotifications();

    // ✅ Utiliser la bonne URL backend depuis env
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      auth: { token: localStorage.getItem("token") }
    });

    socket.on("notification_new", (notif) =>
      setNotifications((prev) => [notif, ...prev])
    );

    return () => socket.disconnect();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await axiosInstance.get("/notifications/me"); // ✅ déjà baseURL
      setNotifications(data);
    } catch {
      toast.error("Impossible de récupérer les notifications");
    }
  };

  /* ─────────── helpers ─────────── */
  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/lire`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
    } catch {
      toast.error("Erreur lors du marquage");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch(`/notifications/lire-tout`);
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      toast.success("Toutes les notifications sont maintenant lues");
    } catch {
      toast.error("Échec du marquage global");
    }
  };

  /* ─────────── filtrage local ─────────── */
  const filtered = notifications.filter((n) => {
    if (filters.lu === "unread" && n.lu) return false;
    if (filters.lu === "read" && !n.lu) return false;
    if (filters.type !== "all" && n.type !== filters.type) return false;
    if (
      filters.q &&
      !`${n.titre}${n.message}${n.email || ""}`
        .toLowerCase()
        .includes(filters.q.toLowerCase())
    )
      return false;
    return true;
  });

  /* ─────────── rendu ─────────── */
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell /> Notifications (Admin)
        </h1>
        <button
          onClick={markAllAsRead}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded"
        >
          Tout marquer comme lu
        </button>
      </div>

      {/* filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 text-sm">
          <Filter size={16} />
          <select
            value={filters.lu}
            onChange={(e) => setFilters({ ...filters, lu: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="all">Type : tous</option>
          <option value="info">Info</option>
          <option value="alert">Alerte</option>
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            placeholder="Recherche…"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="pl-7 pr-2 py-1 text-sm border rounded w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-green-500 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3" />
              <th className="p-3">Titre</th>
              <th className="p-3">Message</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => (
              <tr key={n.id} className={n.lu ? "bg-white" : "bg-green-50"}>
                <td className="p-3">
                  {n.lu ? (
                    <CheckCircle className="text-green-500" size={18} />
                  ) : (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-gray-500 hover:text-green-600"
                      title="Marquer comme lue"
                    >
                      <Circle size={18} />
                    </button>
                  )}
                </td>
                <td className="p-3">{n.titre}</td>
                <td className="p-3">{n.message}</td>
                <td className="p-3 flex items-center gap-1">
                  <Mail size={14} /> {n.email || "–"}
                </td>
                <td className="p-3">
                  {new Date(n.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Aucune notification correspondant au filtre
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
