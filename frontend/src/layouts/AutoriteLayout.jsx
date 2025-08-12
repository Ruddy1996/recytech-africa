import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AutoriteLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
