/* src/pages/ContratsAdmin.jsx */
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  FilePlus, RefreshCw, ChevronsLeft, ChevronsRight,
  Trash, CheckCircle2, PauseCircle, XCircle
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import toast from "react-hot-toast";

/* ------------------------------------------------------------------ */
/* Constantes & Helpers                                               */
/* ------------------------------------------------------------------ */
const API_CONTRATS = "http://localhost:5000/api/contrats";
const API_CLIENTS  = "http://localhost:5000/api/clients";
const API_BORNES   = "http://localhost:5000/api/borne";          // ← adapte si besoin

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const STATUSES = {
  en_cours : { label: "En cours", badge: "bg-green-100 text-green-700" },
  suspendu : { label: "Suspendu", badge: "bg-yellow-100 text-yellow-700" },
  termine  : { label: "Terminé",  badge: "bg-gray-200  text-gray-600"  }
};

/* ------------------------------------------------------------------ */
/* Composant                                                          */
/* ------------------------------------------------------------------ */
export default function ContratsAdmin() {
  /* ───── State principal ───── */
  const [rows,   setRows]   = useState([]);
  const [page,   setPage]   = useState(1);
  const [pages,  setPages]  = useState(1);
  const [filter, setF]      = useState({ q: "", status: "all" });

  /* ───── Référentiels Clients / Bornes ───── */
  const [clients, setClients] = useState([]);
  const [bornes,  setBornes]  = useState([]);

  /* map id → nom/code pour affichage dans le tableau */
  const clientMap = useMemo(
    () => Object.fromEntries(clients.map(c => [c.id, c.nom])),
    [clients]
  );
  const borneMap  = useMemo(
    () => Object.fromEntries(bornes.map(b => [b.id, b.code || b.nom || b.id.slice(0,8)])),
    [bornes]
  );

  /* ───── Modal création ───── */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    borne_id:"", client_id:"", date_debut:"", date_fin:"",
    montant:"",  statut:"en_cours"
  });

  /* ───── Chargement liste contrats ───── */
  useEffect(() => { load(); }, [page, filter]);

  async function load() {
    try {
      const { data, headers } = await axios.get(API_CONTRATS, {
        params : { page, ...filter },
        headers: auth()
      });
      setRows(data);
      setPages(Number(headers["x-total-pages"] || 1));
    } catch {
      toast.error("Impossible de charger les contrats");
    }
  }

  /* ───── Ouverture modal→ charger clients & bornes (une seule fois) ───── */
  async function openModal() {
    setOpen(true);
    if (!clients.length) {
      try {
        const [c, b] = await Promise.all([
          axios.get(API_CLIENTS, { headers: auth() }),
          axios.get(API_BORNES,  { headers: auth() })
        ]);
        setClients(c.data);
        setBornes(b.data);
      } catch {
        toast.error("Impossible de récupérer clients / bornes");
      }
    }
  }

  /* ───── Actions CRUD ───── */
  async function create() {
    try {
      await axios.post(API_CONTRATS, form, { headers: auth() });
      toast.success("Contrat créé");
      setOpen(false);
      setForm({ borne_id:"", client_id:"", date_debut:"", date_fin:"", montant:"", statut:"en_cours" });
      load();
    } catch(e) {
      toast.error(e.response?.data?.message || "Erreur création");
    }
  }

  async function changeStatus(id, statut) {
    try {
      await axios.patch(`${API_CONTRATS}/${id}/status`, { statut }, { headers: auth() });
      setRows(r => r.map(c => c.id === id ? { ...c, statut } : c));
    } catch {
      toast.error("Échec du changement de statut");
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer définitivement ce contrat ?")) return;
    try {
      await axios.delete(`${API_CONTRATS}/${id}`, { headers: auth() });
      setRows(r => r.filter(c => c.id !== id));
    } catch {
      toast.error("Suppression impossible");
    }
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header ------------------------------------------------------- */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Contrats de location</h1>

        <div className="flex gap-3">
          <input
            value={filter.q}
            onChange={e => { setF({ ...filter, q:e.target.value }); setPage(1);} }
            placeholder="Recherche…"
            className="border px-3 py-1 rounded text-sm focus:ring-green-600 outline-none"
          />
          <select
            value={filter.status}
            onChange={e => { setF({ ...filter, status:e.target.value }); setPage(1);} }
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="all">Tous statuts</option>
            {Object.entries(STATUSES).map(([k,v]) =>
              <option key={k} value={k}>{v.label}</option>
            )}
          </select>
          <button onClick={openModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-1">
            <FilePlus size={16}/> Nouveau
          </button>
          <button onClick={load}
                  className="p-1.5 border rounded hover:bg-gray-50">
            <RefreshCw size={16}/>
          </button>
        </div>
      </header>

      {/* Table --------------------------------------------------------- */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider text-gray-600">
              <th className="p-3 text-left">Borne</th>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Période</th>
              <th className="p-3 text-left">Montant ($)</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length ? rows.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-3 border">{borneMap[c.borne_id] || c.borne_id.slice(0,8)+"…"}</td>
                <td className="p-3 border">{clientMap[c.client_id] || c.client_id.slice(0,8)+"…"}</td>
                <td className="p-3 border">
                  {c.date_debut} → {c.date_fin || '—'}
                </td>
                <td className="p-3 border text-right">{Number(c.montant).toFixed(2)}</td>
                <td className="p-3 border text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUSES[c.statut].badge}`}>
                    {STATUSES[c.statut].label}
                  </span>
                </td>
                <td className="p-3 border">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => changeStatus(c.id, 'en_cours')} className="text-green-600" title="Mettre en cours">
                      <CheckCircle2 size={18}/>
                    </button>
                    <button onClick={() => changeStatus(c.id, 'suspendu')} className="text-yellow-600" title="Suspendre">
                      <PauseCircle size={18}/>
                    </button>
                    <button onClick={() => changeStatus(c.id, 'termine')} className="text-gray-500" title="Terminer">
                      <XCircle size={18}/>
                    </button>
                    <button onClick={() => remove(c.id)} className="text-red-600" title="Supprimer">
                      <Trash size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 italic">Aucun contrat</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination ---------------------------------------------------- */}
      {pages>1 && (
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button disabled={page===1}         onClick={()=>setPage(p=>p-1)} className="disabled:opacity-40"><ChevronsLeft/></button>
          <span>Page {page}/{pages}</span>
          <button disabled={page===pages}     onClick={()=>setPage(p=>p+1)} className="disabled:opacity-40"><ChevronsRight/></button>
        </div>
      )}

      {/* Modal création ------------------------------------------------ */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0" >
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">Nouveau contrat</Dialog.Title>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Sélecteur Borne */}
                <select
                  value={form.borne_id}
                  onChange={e=>setForm({...form,borne_id:e.target.value})}
                  className="col-span-1 border px-3 py-2 rounded"
                >
                  <option value="">— Sélectionner une borne —</option>
                  {bornes.map(b =>
                    <option key={b.id} value={b.id}>
                      {b.code || b.nom || b.id.slice(0,8)}
                    </option>
                  )}
                </select>

                {/* Sélecteur Client */}
                <select
                  value={form.client_id}
                  onChange={e=>setForm({...form,client_id:e.target.value})}
                  className="col-span-1 border px-3 py-2 rounded"
                >
                  <option value="">— Sélectionner un client —</option>
                  {clients.map(c =>
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  )}
                </select>

                <input type="date"  value={form.date_debut}
                       onChange={e=>setForm({...form,date_debut:e.target.value})}
                       className="col-span-1 border px-3 py-2 rounded"/>
                <input type="date"  value={form.date_fin}
                       onChange={e=>setForm({...form,date_fin:e.target.value})}
                       className="col-span-1 border px-3 py-2 rounded"/>
                <input placeholder="Montant ($)" value={form.montant}
                       onChange={e=>setForm({...form,montant:e.target.value})}
                       className="col-span-1 border px-3 py-2 rounded"/>
                <select value={form.statut}
                        onChange={e=>setForm({...form,statut:e.target.value})}
                        className="col-span-1 border px-3 py-2 rounded">
                  {Object.entries(STATUSES).map(([k,v]) =>
                    <option key={k} value={k}>{v.label}</option>
                  )}
                </select>
              </div>

              <button onClick={create}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                Enregistrer
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
