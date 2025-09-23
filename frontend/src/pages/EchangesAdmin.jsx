import { useEffect, useState, Fragment } from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import {
  RefreshCw, Eye, Trash, ChevronsLeft, ChevronsRight, Check, X
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";


const STATUS_COLORS = {
  "en_attente": "bg-yellow-100 text-yellow-800",
  "validé": "bg-green-100 text-green-800",
  "refusé": "bg-red-100 text-red-700"
};

export default function EchangesAdmin() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [points, setPoints] = useState([]);

  const perPage = 10;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const slice = rows.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data } = await axiosInstance.get("/echanges");
      setRows(data);
    } catch {
      toast.error("Erreur chargement des échanges");
    }
  }

  async function updateStatut(id, statut) {
    try {
      await axiosInstance.patch(`/echanges/${id}/statut`, { statut });
      toast.success("Statut mis à jour");
      setRows(r => r.map(e => e.id === id ? { ...e, statut } : e));
    } catch {
      toast.error("Erreur mise à jour statut");
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer définitivement cet échange ?")) return;
    try {
      await axiosInstance.delete(`echanges/${id}`);
      setRows(r => r.filter(e => e.id !== id));
      toast.success("Échange supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  }

  async function voirDetails(echange) {
    setSelected(echange);
    try {
      const { data } = await axiosInstance.get(`/points/${echange.user_id}/history`);
      setPoints(data);
    } catch {
      toast.error("Erreur chargement historique points");
      setPoints([]);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Gestion des échanges</h1>
        <button onClick={load} className="p-1.5 border rounded hover:bg-gray-50">
          <RefreshCw size={16} />
        </button>
      </header>

      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>
              <th className="p-3 text-left">Utilisateur</th>
              <th className="p-3 text-left">Récompense</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {slice.length ? slice.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="p-3">{e.nom} {e.prenom}</td>
                <td className="p-3">{e.titre}</td>
                <td className="p-3">{new Date(e.date_echange).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[e.statut]}`}>{e.statut}</span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => voirDetails(e)} className="text-blue-600">
                    <Eye size={16} />
                  </button>
                  {e.statut !== 'validé' && (
                    <button onClick={() => updateStatut(e.id, 'validé')} className="text-green-600">
                      <Check size={16} />
                    </button>
                  )}
                  {e.statut !== 'refusé' && (
                    <button onClick={() => updateStatut(e.id, 'refusé')} className="text-red-600">
                      <X size={16} />
                    </button>
                  )}
                  <button onClick={() => remove(e.id)} className="text-gray-500">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500 italic">Aucun échange</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="disabled:opacity-40">
            <ChevronsLeft size={16} />
          </button>
          <span>Page {page} / {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="disabled:opacity-40">
            <ChevronsRight size={16} />
          </button>
        </div>
      )}

      {/* 🧾 Section latérale - Drawer */}
      <Transition show={!!selected} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelected(null)}>
          <Transition.Child as={Fragment}
            enter="transition-opacity ease-out duration-200"
            enterFrom="opacity-0" enterTo="opacity-100"
            leave="transition-opacity ease-in duration-150"
            leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex justify-end">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 overflow-y-auto shadow-xl">
              {selected && (
                <>
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Détails de l’échange
                  </Dialog.Title>
                  <p><strong>Utilisateur :</strong> {selected.nom} {selected.prenom}</p>
                  <p><strong>Récompense :</strong> {selected.titre}</p>
                  <p><strong>Statut :</strong> {selected.statut}</p>
                  <p><strong>Date :</strong> {new Date(selected.date_echange).toLocaleString()}</p>

                  <hr className="my-4" />
                  <h3 className="text-sm font-semibold mb-2">📊 Historique des points</h3>
                  <ul className="space-y-2 text-sm">
                    {points.length ? points.map(p => (
                      <li key={p.id} className="border px-3 py-2 rounded">
                        <div className="flex justify-between">
                          <span>{p.type === 'gain' ? "Gain" : "Déduction"}</span>
                          <span className={p.type === 'gain' ? "text-green-600" : "text-red-600"}>
                            {p.type === 'gain' ? "+" : "-"}{p.montant} pts
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{new Date(p.date).toLocaleString()}</div>
                        <div className="text-xs italic">{p.description}</div>
                      </li>
                    )) : (
                      <li className="text-gray-500 italic">Aucune donnée</li>
                    )}
                  </ul>
                </>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
