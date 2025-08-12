
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  RefreshCw,
  ChevronsLeft,
  ChevronsRight,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const API = "http://localhost:5000/api/tirages";           // ← singulier ! 
const auth = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const TYPE_OPTIONS = {
  standard: { label: "Standard", cls: "bg-gray-100 text-gray-700" },
  premium:  { label: "Premium",  cls: "bg-purple-100 text-purple-700" },
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function TiragesAdmin() {
  /* ─────────── state ─────────── */
  const [rows,  setRows]  = useState([]);
  const [page,  setPage]  = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ q: "", actif: "all" });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "standard",
    points_participation: 0,
    date_debut: "",
    date_fin: "",
  });

  /* ─────────── fetch (sans retour de Promise) ─────────── */
  useEffect(() => {
    async function load() {
      try {
        const { data, headers } = await axios.get(API, {
          params : { page, q: filters.q, actif: filters.actif },
          headers: auth(),
        });
        setRows(data);
        setPages(Number(headers["x-total-pages"] || 1));
      } catch {
        toast.error("Impossible de charger les tirages");
      }
    }
    load();
  }, [page, filters]);   // ✅ useEffect ne retourne plus rien

  /* ─────────── actions ─────────── */
  const create = async () => {
    try {
      await axios.post(API, form, { headers: auth() });
      toast.success("Tirage créé");
      setOpen(false);
      setForm({
        titre: "", description: "", type: "standard",
        points_participation: 0, date_debut: "", date_fin: "",
      });
      setPage(1);   // rafraîchir première page
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur création");
    }
  };

  const toggleActif = async (id, actif) => {
    try {
      await axios.patch(`${API}/${id}/actif`, { actif: !actif }, { headers: auth() });
      setRows(r => r.map(t => t.id === id ? { ...t, actif: !actif } : t));
    } catch { toast.error("Échec modification statut"); }
  };

  const draw = async (id) => {
    if (!confirm("Tirer un gagnant ?")) return;
    try {
      await axios.post(`${API}/${id}/draw`, {}, { headers: auth() });
      toast.success("🥳 Gagnant tiré !");
      setPage(1);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur tirage");
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* header --------------------------------------------------------- */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestion des tirages</h1>

        <div className="flex gap-3">
          <input
            value={filters.q}
            onChange={e => { setFilters({ ...filters, q: e.target.value }); setPage(1); }}
            placeholder="Recherche…"
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-green-600 focus:outline-none"
          />

          <select
            value={filters.actif}
            onChange={e => { setFilters({ ...filters, actif: e.target.value }); setPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>

          <button
            onClick={() => setOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Plus size={16}/> Nouveau
          </button>

          <button onClick={() => setPage(p => p)}  /* juste rafraîchir */
                  className="p-1.5 border rounded hover:bg-gray-50"
                  title="Rafraîchir">
            <RefreshCw size={16}/>
          </button>
        </div>
      </header>

      {/* table ---------------------------------------------------------- */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm rounded shadow">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider  text-gray-600">
              <th className="p-3  w-1/6">Titre</th>
              <th className="p-3 text-left">Dates</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3  text-left">Pts</th>
              <th className="p-3  text-left">Actif</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 border-b">
                <td className="p-3 border font-medium">{t.titre}</td>
                <td className="p-3 border">{t.date_debut} → {t.date_fin}</td>
                <td className="p-3 border">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                   ${TYPE_OPTIONS[t.type]?.cls || "bg-gray-100"}`}>
                    {TYPE_OPTIONS[t.type]?.label || t.type}
                  </span>
                </td>
                <td className="p-3 border text-center">{t.points_participation}</td>
                <td className="p-3 border text-center">
                  {t.actif ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      • actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      • inactif
                    </span>
                  )}
                </td>
                <td className="p-3 border">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => toggleActif(t.id, t.actif)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Activer / Désactiver">
                      {t.actif ? <ToggleRight/> : <ToggleLeft/>}
                    </button>
                    <button onClick={() => draw(t.id)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Tirer le gagnant">
                      <Zap/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500 italic">Aucun tirage</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination ---------------------------------------------------- */}
      {pages > 1 && (
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button disabled={page === 1}        onClick={() => setPage(p => p - 1)} className="disabled:opacity-40"><ChevronsLeft/></button>
          <span>Page {page}/{pages}</span>
          <button disabled={page === pages}    onClick={() => setPage(p => p + 1)} className="disabled:opacity-40"><ChevronsRight/></button>
        </div>
      )}

      {/* modal (création) --------------------------------------------- */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">Nouveau tirage</Dialog.Title>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <input  className="col-span-2 border px-3 py-2 rounded"
                        placeholder="Titre" value={form.titre}
                        onChange={e => setForm({...form, titre:e.target.value})} />

                <textarea className="col-span-2 border px-3 py-2 rounded h-24 resize-none"
                          placeholder="Description" value={form.description}
                          onChange={e => setForm({...form, description:e.target.value})} />

                <select className="border px-3 py-2 rounded"
                        value={form.type}
                        onChange={e => setForm({...form, type:e.target.value})}>
                  {Object.entries(TYPE_OPTIONS).map(([k,v]) =>
                    <option key={k} value={k}>{v.label}</option>
                  )}
                </select>

                <input  className="border px-3 py-2 rounded"
                        type="number" min="0"
                        placeholder="Points" value={form.points_participation}
                        onChange={e => setForm({...form, points_participation:Number(e.target.value)})} />

                <input  className="border px-3 py-2 rounded"
                        type="date" placeholder="Début" value={form.date_debut}
                        onChange={e => setForm({...form, date_debut:e.target.value})} />

                <input  className="border px-3 py-2 rounded"
                        type="date" placeholder="Fin" value={form.date_fin}
                        onChange={e => setForm({...form, date_fin:e.target.value})} />
              </div>

              <button onClick={create}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                Créer
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
