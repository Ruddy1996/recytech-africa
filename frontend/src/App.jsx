// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useEffect } from "react";

/* Socket */
import { initSocket } from "../src/socket";

/* Layouts */
import AdminLayout from "./layouts/AdminLayout";
import AutoriteLayout from "./layouts/AutoriteLayout";
import UserLayout from "./layouts/UserLayout";

/* Auth */
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import NouveauMotDePasse from "./pages/NouveauMotDePasse";

/* Dashboards */
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardAutorite from "./pages/DashboardAutorite";
import DashboardUser from "./pages/DashboardUser";

/* Pages Admin */
import ProfilPage from "./pages/ProfilPage";
import NotificationsAdmin from "./pages/NotificationsAdmin";
import UsersAdmin from "./pages/UsersAdmin";
import Clients from "./pages/ClientsPage";
/*import Clients from "./pages/ClientsPage"; */
import ContratsAdmin from "./pages/ContratsAdmin";
import InterventionsAdmin from "./pages/InterventionsAdmin";
import TiragesAdmin from "./pages/TiragesAdmin";
import PaiementsAdmin from "./pages/PaiementsAdmin";
import PlansAdmin from "./pages/PlansAdmin";
import BadgesAdmin from "./pages/BadgesAdmin";
import RecompensesAdmin from "./pages/RecompensesAdmin";
import EchangesAdmin from "./pages/EchangesAdmin";
import AlertesAdmin from "./pages/AlertesAdmin";
import BornesAdmin from "./pages/BornesAdmin";
import DepotsPage from "./pages/DepotsPage";

/* Pages Autorité */
import AlertesAutorite from "./pages/autorite/AlertesAutorite";
import BornesAutorite from "./pages/autorite/BornesAutorite";
import StatistiquesAutorite from "./pages/autorite/StatistiquesAutorite";

/* Pages Utilisateur */
import RecompensesUser from "./pages/user/RecompensesUser";
import TiragesUser from "./pages/user/TiragesUser";
import NotificationsUser from "./pages/user/NotificationsUser";

function App() {
  useEffect(() => {
    const socket = initSocket();

    // 🔔 Réception en temps réel d’un nouveau dépôt
    socket.on("nouveau_depot", (depot) => {
      console.log("📥 Nouveau dépôt reçu :", depot);

      // Notification toast
      toast.success(
        `Nouveau dépôt : ${depot.poids} kg de ${depot.type_dechet} (+${depot.points} pts)`
      );
    });

    return () => {
      socket.off("nouveau_depot");
    };
  }, []);

  return (
    <Router>
      {/* Toutes les routes */}
      <Routes>
        {/* Auth & reset password */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/nouveau-mot-de-passe" element={<NouveauMotDePasse />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="notifications" element={<NotificationsAdmin />} />
          <Route path="utilisateurs" element={<UsersAdmin />} />
          <Route path="clients" element={<Clients />} />
          <Route path="contrats" element={<ContratsAdmin />} />
          <Route path="interventions" element={<InterventionsAdmin />} />
          <Route path="tirages" element={<TiragesAdmin />} />
          <Route path="paiements" element={<PaiementsAdmin />} />
          <Route path="plans" element={<PlansAdmin />} />
          <Route path="badges" element={<BadgesAdmin />} />
          <Route path="recompenses" element={<RecompensesAdmin />} />
          <Route path="echanges" element={<EchangesAdmin />} />
          <Route path="alertes" element={<AlertesAdmin />} />
          <Route path="bornes" element={<BornesAdmin />} />
          <Route path="depots" element={<DepotsPage />} />
        </Route>

        {/* Autorité */}
        <Route path="/autorite" element={<AutoriteLayout />}>
          <Route index element={<DashboardAutorite />} />
          <Route path="alertes" element={<AlertesAutorite />} />
          <Route path="bornes" element={<BornesAutorite />} />
          <Route path="stats" element={<StatistiquesAutorite />} />
        </Route>

        {/* Utilisateur */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<DashboardUser />} />
          <Route path="recompenses" element={<RecompensesUser />} />
          <Route path="tirages" element={<TiragesUser />} />
          <Route path="notifications" element={<NotificationsUser />} />
        </Route>
      </Routes>

      {/* Toaster global (notifications) */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#f9fafb", // gray-50
            border: "1px solid #e5e7eb", // gray-200
            color: "#374151", // gray-700
            fontSize: "0.875rem",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
          },
          success: {
            style: { background: "#ecfdf5", color: "#065f46" }, // vert
            icon: "✅",
          },
          error: {
            style: { background: "#fef2f2", color: "#991b1b" }, // rouge
            icon: "❌",
          },
        }}
      />
    </Router>
  );
}

export default App;
