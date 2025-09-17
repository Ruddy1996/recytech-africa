// src/pages/DepotsPage.jsx
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { Users, Database, Calendar } from "lucide-react";

export default function DepotsPage() {
  const [depots, setDepots] = useState([]);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [selectedDepot, setSelectedDepot] = useState(null);

  useEffect(() => {
    fetchDepots({ page: currentPage });
  }, []);

  const fetchDepots = async (filters = {}) => {
    try {
      const token = localStorage.getItem("token");
      const params = {
        page: filters.page || currentPage,
        limit: pageSize,
        search: filters.search || searchQuery,
      };
      if (filters.user || filterUser) params.user = filters.user || filterUser;
      if (filters.startDate || filterStartDate)
        params.startDate = filters.startDate || filterStartDate;
      if (filters.endDate || filterEndDate)
        params.endDate = filters.endDate || filterEndDate;

      const res = await axios.get("/api/stats/par-jour", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setDepots(res.data.depots || []);
      setStats(res.data.stats || {});
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error("Erreur récupération dépôts :", err);
    }
  };

  const handleFilterChange = () => {
    fetchDepots({ page: 1 });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-6">Dépôts</h2>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total utilisateurs" value={stats.total_users} icon={Users} borderColor="border-green-600" />
        <StatCard title="Total dépôts" value={stats.total_depots} icon={Database} borderColor="border-blue-600" />
        <StatCard title="Points cumulés" value={stats.total_points} icon={Database} borderColor="border-yellow-600" />
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          className="p-2 border rounded flex-1"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchDepots({ search: e.target.value, page: 1 });
          }}
        />
        <input
          type="text"
          placeholder="Filtrer par utilisateur"
          className="p-2 border rounded flex-1"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          onBlur={handleFilterChange}
        />
        <input
          type="date"
          className="p-2 border rounded"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          onBlur={handleFilterChange}
        />
        <input
          type="date"
          className="p-2 border rounded"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          onBlur={handleFilterChange}
        />
      </div>

      {/* Table dépôts */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>
              <th className="p-3 text-left">Utilisateur</th>
              <th className="p-3 text-left">Dépôt</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {depots.length ? (
              depots.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-3">{d.user_name}</td>
                  <td className="p-3">{d.depot_type}</td>
                  <td className="p-3">{d.points}</td>
                  <td className="p-3">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedDepot(d)}
                      className="text-blue-600 hover:underline"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                  Aucun dépôt trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() =>
            currentPage > 1 &&
            setCurrentPage((prev) => {
              const newPage = prev - 1;
              fetchDepots({ page: newPage });
              return newPage;
            })
          }
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Précédent
        </button>

        <span className="px-3 py-1 bg-gray-100 rounded">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() =>
            currentPage < totalPages &&
            setCurrentPage((prev) => {
              const newPage = prev + 1;
              fetchDepots({ page: newPage });
              return newPage;
            })
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>

      {/* Détails dépôt */}
      {selectedDepot && (
        <Transition show={true} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => setSelectedDepot(null)}
          >
            <div className="fixed inset-0 flex justify-center items-center bg-black/30">
              <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded shadow-lg overflow-y-auto">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Détail du dépôt
                </Dialog.Title>
                <p><strong>Utilisateur :</strong> {selectedDepot.user_name}</p>
                <p><strong>Dépôt :</strong> {selectedDepot.depot_type}</p>
                <p><strong>Points :</strong> {selectedDepot.points}</p>
                <p><strong>Date :</strong> {new Date(selectedDepot.created_at).toLocaleString()}</p>
                <p><strong>Statut :</strong> {selectedDepot.status}</p>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
}

// StatCard component
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
