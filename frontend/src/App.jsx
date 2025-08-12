// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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
import Clients from "./pages/clients";
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

/* Pages Autorité */
import AlertesAutorite from "./pages/autorite/AlertesAutorite";
import BornesAutorite from "./pages/autorite/BornesAutorite";
import StatistiquesAutorite from "./pages/autorite/StatistiquesAutorite";

/* Pages Utilisateur */
import RecompensesUser from "./pages/user/RecompensesUser";
import TiragesUser from "./pages/user/TiragesUser";
import NotificationsUser from "./pages/user/NotificationsUser";

function App() {
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
          <Route path="Notifications" element={<NotificationsAdmin />} />
          <Route path="utilisateurs" element={<UsersAdmin />} />
          <Route path="clients" element={<Clients />} />
          <Route path="Contrats" element={<ContratsAdmin />} />
          <Route path="interventions" element={<InterventionsAdmin />} />
          <Route path="tirages" element={<TiragesAdmin />} />
          <Route path="paiements" element={<PaiementsAdmin />} />
          <Route path="plans" element={<PlansAdmin />} />
          <Route path="badges" element={<BadgesAdmin />} />
          <Route path="recompenses" element={<RecompensesAdmin />} />
          <Route path="echanges" element={<EchangesAdmin />} />
          <Route path="alertes" element={<AlertesAdmin />} />
          <Route path="bornes" element={<BornesAdmin />} />
          
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
          duration: 3000,
          style: { background: "#fff", color: "#374151", fontSize: "0.875rem" }, // tailwind gray-700
          success: { icon: "✅" },
          error: { icon: "❌" },
        }}
      />
    </Router>
  );
}

export default App;
