import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, Home, Bell, User, Settings,
  Gift, BadgeCheck, Wallet, AlertCircle,
  Building2, Database, Users, LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/logo.png";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const role = user?.role;
  const isAdmin = role === "Admin";
  const isUser = role === "user";
  const isAutorite = role === "Autorite";

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "bg-green-700 text-white font-semibold"
      : "hover:bg-green-700 hover:text-white";

  const links = [
    { to: `/${role}`, label: "Dashboard", icon: <Home size={20} /> },
    ...(isAdmin
      ? [
          { to: "/admin/depots", label: "Dépôts", icon: <Database size={18} /> },
          { to: "/admin/bornes", label: "Bornes", icon: <Building2 size={18} /> },
          { to: "/admin/alertes", label: "Alertes", icon: <AlertCircle size={18} /> },
          { to: "/admin/utilisateurs", label: "Utilisateurs", icon: <Users size={18} /> },
          { to: "/admin/clients", label: "Clients", icon: <Users size={18} /> },
          { to: "/admin/contrats", label: "Contrats", icon: <Users size={18} /> },
          { to: "/admin/interventions", label: "Interventions", icon: <Users size={18} /> },
          { to: "/admin/badges", label: "Badges", icon: <Gift size={18} /> },
          { to: "/admin/recompenses", label: "Récompenses", icon: <Gift size={18} /> },
          { to: "/admin/echanges", label: "Échanges", icon: <Gift size={18} /> },
          { to: "/admin/tirages", label: "Tirages", icon: <BadgeCheck size={18} /> },
          { to: "/admin/plans", label: "Plans", icon: <BadgeCheck size={18} /> },
          { to: "/admin/paiements", label: "Paiements", icon: <Wallet size={18} /> },
          { to: "/admin/parametres", label: "Paramètres", icon: <Settings size={18} /> },
        ]
      : isUser
      ? [
          { to: "/user/recompenses", label: "Récompenses", icon: <Gift size={18} /> },
          { to: "/user/tirages", label: "Tirages", icon: <BadgeCheck size={18} /> },
          { to: "/user/notifications", label: "Notifications", icon: <Bell size={18} /> },
        ]
      : isAutorite
      ? [
          { to: "/autorite/alertes", label: "Alertes", icon: <AlertCircle size={18} /> },
          { to: "/autorite/bornes", label: "Bornes", icon: <Building2 size={18} /> },
          { to: "/autorite/stats", label: "Statistiques", icon: <Database size={18} /> },
        ]
      : []),
  ];

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-700 text-white p-2 rounded"
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-green-800 text-white flex flex-col shadow-lg z-40 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-4 border-b border-green-700">
          <img src={Logo} alt="RecyTech" className="h-16" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all ${isActive(
                item.to
              )}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-green-700 px-4 py-4">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex items-center w-full gap-2 text-red-200 hover:text-red-100"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
