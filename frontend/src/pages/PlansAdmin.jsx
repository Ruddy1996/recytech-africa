import { useEffect, useState, Fragment } from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import {
  Plus, RefreshCw, Edit, Trash,
  ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Dialog, Switch, Transition } from "@headlessui/react";

/* -------------------------------------------------------------------- */
/* Helpers                                                              */
/* -------------------------------------------------------------------- *

/* -------------------------------------------------------------------- */
/* Component                                                            */
/* -------------------------------------------------------------------- */
export default function PlansAdmin() {
  /* ─────────── state ─────────── */
  const [plans, setPlans] = useState([]);
  const [page, setPage]   = useState(1);
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(plans.length / perPage));
  const slice = plans.slice((page - 1) * perPage, page * perPage);

  /* Modal (création / édition) */
  const [open, setOpen]   = useState(false);
  const [editId, setEdit] = useState(null);
  const [form, setForm]   = useState({
    nom:          "",
    description:  "",
    prix_mensuel: "",
    nb_utilisateurs: "",
    acces_data: true,
    acces_alertes: true,
    acces_export: false,
  });

  /* ─────────── fetch ─────────── */
  useEffect(() => { void fetchPlans(); }, []);

  async function fetchPlans() {
    try {
      const { data } = await axiosInstance.get("/plans");
      setPlans(data);
    } catch {
      toast.error("Impossible de charger les plans");
    }
  }

  /* ─────────── helpers ─────────── */
  function resetForm() {
    setForm({
      nom: "", description: "", prix_mensuel: "",
      nb_utilisateurs:"", acces_data:true,
      acces_alertes:true,  acces_export:false
    });
    setEdit(null);
  }

  async function savePlan() {
    const method   = editId ? "put" : "post";
    const endpoint = editId ? `/plans/${editId}` : "/plans";
    try {
      const { data } = await axiosInstance[method](endpoint, form);
      toast.success(editId ? "Plan mis à jour" : "Plan créé");
      setOpen(false);
      resetForm();
      /* MAJ locale */
      if (editId) {
        setPlans(p => p.map(pl => (pl.id === editId ? data : pl)));
      } else {
        setPlans(p => [data, ...p]);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur d’enregistrement");
    }
  }

  async function removePlan(id) {
    if (!window.confirm("Supprimer ce plan ?")) return;
    try {
      await axiosInstance.delete(`/plans/${id}`);
      setPlans(p => p.filter(pl => pl.id !== id));
      toast.success("Plan supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  }

  /* -------------------------------------------------------------------- */
  /* UI                                                                   */
  /* -------------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Plans tarifaires</h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow"
            onClick={() => { resetForm(); setOpen(true); }}
          >
            <Plus size={16}/> Nouveau
          </button>
          <button
            className="p-1.5 border rounded hover:bg-gray-50"
            onClick={fetchPlans}
          >
            <RefreshCw size={16}/>
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm rounded shadow">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider  text-gray-600">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Prix&nbsp;/&nbsp;mois</th>
              <th className="p-3 text-left">Utilisateurs</th>
              <th className="p-3  text-left">Data</th>
              <th className="p-3  text-left">Alertes</th>
              <th className="p-3  text-left">Export</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {slice.length ? slice.map(pl => (
              <tr key={pl.id} className="hover:bg-gray-50">
                <td className="p-3 border font-medium">{pl.nom}</td>
                <td className="p-3 border">{Number(pl.prix_mensuel).toLocaleString()} CDF</td>
                <td className="p-3 border">{pl.nb_utilisateurs || "—"}</td>
                <td className="p-3 border text-center">{pl.acces_data     ? "✔︎" : "—"}</td>
                <td className="p-3 border text-center">{pl.acces_alertes  ? "✔︎" : "—"}</td>
                <td className="p-3 border text-center">{pl.acces_export   ? "✔︎" : "—"}</td>
                <td className="p-3 border">
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Éditer"
                      onClick={() => { setForm(pl); setEdit(pl.id); setOpen(true); }}
                    >
                      <Edit size={18}/>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                      onClick={() => removePlan(pl.id)}
                    >
                      <Trash size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500 italic">Aucun plan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination simple */}
      {pages > 1 &&
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="disabled:opacity-40 hover:text-green-700"
          >
            <ChevronsLeft/>
          </button>
          <span>Page {page} / {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(p => p + 1)}
            className="disabled:opacity-40 hover:text-green-700"
          >
            <ChevronsRight/>
          </button>
        </div>
      }

      {/* ---------------------------------------------------------------- */
      /* Modal création / édition                                          */
      /* ---------------------------------------------------------------- */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                {editId ? "Modifier le plan" : "Nouveau plan"}
              </Dialog.Title>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <input
                  className="col-span-2 border px-3 py-2 rounded"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                />
                <textarea
                  className="col-span-2 border px-3 py-2 rounded resize-none"
                  placeholder="Description"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <input
                  className="border px-3 py-2 rounded"
                  type="number"
                  min="0"
                  placeholder="Prix mensuel (CDF)"
                  value={form.prix_mensuel}
                  onChange={e => setForm({ ...form, prix_mensuel: e.target.value })}
                />
                <input
                  className="border px-3 py-2 rounded"
                  type="number"
                  min="0"
                  placeholder="Nb utilisateurs"
                  value={form.nb_utilisateurs}
                  onChange={e => setForm({ ...form, nb_utilisateurs: e.target.value })}
                />

                {[
                  { key: "acces_data",     label: "Accès aux données"      },
                  { key: "acces_alertes",  label: "Accès aux alertes"      },
                  { key: "acces_export",   label: "Export CSV/Excel"       },
                ].map(item => (
                  <div key={item.key} className="col-span-2 flex items-center justify-between border rounded px-3 py-2">
                    <span>{item.label}</span>
                    <Switch
                      checked={form[item.key]}
                      onChange={val => setForm({ ...form, [item.key]: val })}
                      className={`${form[item.key] ? 'bg-green-600' : 'bg-gray-300'}
                                  relative inline-flex h-5 w-10 items-center rounded-full transition`}
                    >
                      <span
                        className={`${form[item.key] ? 'translate-x-5' : 'translate-x-1'}
                                    inline-block h-3.5 w-3.5 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                ))}
              </div>

              <button
                onClick={savePlan}
                className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                {editId ? "Mettre à jour" : "Créer"}
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
