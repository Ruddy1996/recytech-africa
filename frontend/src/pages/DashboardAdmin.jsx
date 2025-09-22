// src/pages/DashboardAdmin.jsx
import { useEffect, useState, Fragment } from "react";
import { initSocket } from "../socket";
import axiosInstance from "../api/axiosInstance";
import {
  Users,
  MapPin,
  Database,
  Star,
  Wifi,
  WifiOff,
  Droplet,
  Gauge,
  Thermometer,
  Battery,
  Leaf,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import CarteBornes from "../components/CarteBornes";
import StatPie from "../components/StatPie";
import DataTableBornes from "../components/DataTableBornes";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_bornes: 0,
    total_depots: 0,
    total_points: 0,
  });

  const [borneStats, setBorneStats] = useState({
    online: 0,
    offline: 0,
    moy_humidite: 0,
    moy_remplissage: 0,
    moy_temperature: 0,
    moy_battery: 0,
    co2_evite: 0,
    bornes: [],
  });

  const [alertes, setAlertes] = useState([]);
  const [alerteSelectionnee, setAlerteSelectionnee] = useState(null);

  // Fonction pour récupérer stats globales
  const fetchStats = async () => {
  try {
    
    const res = await axiosInstance.get("/api/stats/global");
    setStats(res.data);
    
  } catch (err) {
    console.error("Erreur récupération stats globales :", err);
  }
};

  // Récupération initiale + rafraîchissement toutes les 10s
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, []);

  // Socket.io
  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;

    socket.on("connect", () => console.log("🟢 Socket Dashboard connecté :", socket.id));
    socket.on("disconnect", (reason) => console.warn("🔴 Socket déconnecté :", reason));

    socket.on("borne_stats_update", (data) => {
      console.log("📊 borne_stats_update reçu :", data);
      setBorneStats((prev) => ({ ...prev, ...data }));
    });

    socket.on("new_alerte", (alerte) => {
      console.log("🚨 Nouvelle alerte :", alerte);
      setAlertes((prev) => [alerte, ...prev]);
    });

    socket.on("alerte_resolue", (alerte) => {
      console.log("✅ Alerte résolue :", alerte);
      setAlertes((prev) => prev.map((a) => (a.id === alerte.id ? alerte : a)));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("borne_stats_update");
      socket.off("new_alerte");
      socket.off("alerte_resolue");
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h2 className="text-2xl font-semibold mb-6">Tableau de bord</h2>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Utilisateurs" value={stats.total_users} icon={Users} borderColor="border-green-600" />
            <StatCard title="Bornes" value={stats.total_bornes} icon={MapPin} borderColor="border-blue-600" />
            <StatCard title="Dépôts" value={stats.total_depots} icon={Database} borderColor="border-yellow-600" />
            <StatCard title="Points cumulés" value={stats.total_points} icon={Star} borderColor="border-purple-600" />
          </div>

          {/* Statistiques bornes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <StatCard title="Bornes en ligne" value={borneStats.online} icon={Wifi} borderColor="border-green-600" />
            <StatCard title="Bornes hors ligne" value={borneStats.offline} icon={WifiOff} borderColor="border-red-600" />
            <StatCard title="Humidité moyenne" value={`${borneStats.moy_humidite ?? 0}%`} icon={Droplet} borderColor="border-blue-600" />
            <StatCard title="Remplissage moyen" value={`${borneStats.moy_remplissage ?? 0}%`} icon={Gauge} borderColor="border-yellow-600" />
            <StatCard title="Température moyenne" value={`${borneStats.moy_temperature ?? 0}°C`} icon={Thermometer} borderColor="border-orange-600" />
            <StatCard title="Batterie moyenne" value={`${borneStats.moy_battery ?? 0}%`} icon={Battery} borderColor="border-gray-600" />
            <StatCard title="CO2 évité" value={`${borneStats.co2_evite ?? 0} kg`} icon={Leaf} borderColor="border-green-800" />
          </div>

          {/* Carte & stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <CarteBornes bornes={borneStats.bornes} enableZoom enableFilters />
            <StatPie online={borneStats.online} offline={borneStats.offline} />
          </div>

          {/* Table bornes */}
          <h3 className="text-xl font-semibold mt-10 mb-4">Résumé des bornes</h3>
          <DataTableBornes bornes={borneStats.bornes} />

          {/* Alertes */}
          <h3 className="text-xl font-semibold mt-10 mb-4">Alertes en temps réel</h3>
          <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
            <table className="min-w-full divide-y text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                <tr>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Message</th>
                  <th className="p-3 text-left">Niveau</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {alertes.length ? alertes.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="p-3">{a.type_alerte}</td>
                    <td className="p-3">{a.message}</td>
                    <td className="p-3">{a.niveau}</td>
                    <td className="p-3">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <button onClick={() => setAlerteSelectionnee(a)} className="text-blue-600 hover:underline">Détails</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 italic">Aucune alerte</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Détails alerte */}
          {alerteSelectionnee && (
            <Transition show={true} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setAlerteSelectionnee(null)}>
                <div className="fixed inset-0 flex justify-end">
                  <Dialog.Panel className="w-full max-w-md bg-white p-6 shadow-xl overflow-y-auto">
                    <Dialog.Title className="text-lg font-semibold mb-4">Détail de l’alerte</Dialog.Title>
                    <p><strong>Type :</strong> {alerteSelectionnee.type_alerte}</p>
                    <p><strong>Niveau :</strong> {alerteSelectionnee.niveau}</p>
                    <p><strong>Message :</strong> {alerteSelectionnee.message}</p>
                    <p><strong>Date :</strong> {new Date(alerteSelectionnee.created_at).toLocaleString()}</p>
                    <p><strong>Résolue :</strong> {alerteSelectionnee.est_resolue ? "Oui" : "Non"}</p>
                  </Dialog.Panel>
                </div>
              </Dialog>
            </Transition>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, borderColor }) {
  return (
    <div className={`flex items-center gap-4 bg-white shadow rounded-lg p-4 border-l-4 ${borderColor}`}>
      <div className="p-3 bg-green-100 rounded-full">
        <Icon className="text-green-700" size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-green-800">{value ?? "..."}</p>
      </div>
    </div>
  );
}
