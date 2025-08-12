/* eslint-disable react-hooks/exhaustive-deps */

import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus, RefreshCw,
  ChevronsLeft, ChevronsRight,
  Trash, PlayCircle, PauseCircle,
  CheckCircle2, XCircle, CalendarClock
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const API  = "http://localhost:5000/api/intervention-borne";
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* Statuts disponibles + badges ------------------------------------- */
const STATUTS = {
  planifiee : { label: "Planifiée",  badge: "bg-sky-100  text-sky-700",    icon: CalendarClock },
  en_cours  : { label: "En cours",   badge: "bg-yellow-100 text-yellow-700",icon: PlayCircle },
  terminee  : { label: "Terminée",   badge: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  annulee   : { label: "Annulée",    badge: "bg-gray-200 text-gray-600",    icon: XCircle }
};

/* Pour le sélecteur «type*/
const TYPES = ["Maintenance préventive","Réparation","Nettoyage","Inspection"];

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function InterventionsAdmin() {
  /* -------------------- state -------------------- */
  const [rows,  setRows ] = useState([]);
  const [page,  setPage ] = useState(1);
  const [pages, setPages] = useState(1);
  const [filt,  setFilt ] = useState({ q:"", statut:"all" });

  /* Modal création */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    borne_id:"", type_intervention:TYPES[0], description:"",
    date_intervention:"", intervenant:"", statut:"planifiee"
  });

  /* Liste des bornes (pour select) */
  const [bornes, setBornes] = useState([]);

  /* -------------------- fetch -------------------- */
  useEffect(() => { load(); loadBornes(); }, [page, filt]);

  async function load() {
    try {
      const { data, headers } = await axios.get(API, {
        params : { page, q:filt.q, statut:filt.statut },
        headers: auth()
      });
      setRows(data);
      setPages(Number(headers["x-total-pages"]||1));
    } catch { toast.error("Impossible de charger les interventions"); }
  }

  async function loadBornes() {
    /* vous avez sûrement déjà un endpoint /api/borne */
    try {
      const { data } = await axios.get("http://localhost:5000/api/borne?limit=1000", { headers: auth() });
      setBornes(data);
    } catch {/* silent */}
  }

  /* -------------------- actions ------------------ */
  async function create() {
    try {
      await axios.post(API, form, { headers: auth() });
      toast.success("Intervention créée");
      setOpen(false);
      setForm({ borne_id:"", type_intervention:TYPES[0], description:"",
                date_intervention:"", intervenant:"", statut:"planifiee" });
      load();
    } catch(e) {
      toast.error(e.response?.data?.message || "Erreur création");
    }
  }

  async function changeStatut(id, statut) {
    try {
      await axios.put(`${API}/${id}`, { statut }, { headers: auth() });
      setRows(r => r.map(i => i.id===id ? { ...i, statut } : i));
    } catch {
      toast.error("Changement de statut impossible");
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cette intervention ?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: auth() });
      setRows(r => r.filter(i => i.id!==id));
    } catch { toast.error("Suppression impossible"); }
  }

  /* -------------------- UI ----------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestion des Interventions – Bornes</h1>

        <div className="flex items-center gap-3">
          <input
            value={filt.q}
            onChange={e => { setFilt({ ...filt, q:e.target.value }); setPage(1); }}
            placeholder="Recherche…"
            className="border px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select
            value={filt.statut}
            onChange={e => { setFilt({ ...filt, statut:e.target.value }); setPage(1); }}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="all">Tous statuts</option>
            {Object.entries(STATUTS).map(([k,v]) =>
              <option key={k} value={k}>{v.label}</option>
            )}
          </select>
          <button onClick={() => setOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-1 shadow">
            <Plus size={16}/> Nouvelle
          </button>
          <button onClick={load} className="p-1.5 border rounded hover:bg-gray-50">
            <RefreshCw size={16}/>
          </button>
        </div>
      </header>

      {/* table */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm rounded shadow">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider  text-gray-600">
              <th className="p-3 text-left">Borne</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Intervenant</th>
              <th className="p-3  text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
          {rows.length ? rows.map(i => (
            <tr key={i.id} className="hover:bg-gray-50">
              <td className="p-3 border">{i.borne_id.slice(0,8)}…</td>
              <td className="p-3 border">{i.type_intervention}</td>
              <td className="p-3 border max-w-xs">{i.description}</td>
              <td className="p-3 border">{new Date(i.date_intervention).toLocaleDateString()}</td>
              <td className="p-3 border">{i.intervenant}</td>
              <td className="p-3 border text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUTS[i.statut].badge}`}>
                  {STATUTS[i.statut].label}
                </span>
              </td>
              <td className="p-3 border">
                <div className="flex justify-end gap-2">
                  {/* Boutons de changement rapide de statut */}
                  <button title="Planifier"  onClick={()=>changeStatut(i.id,"planifiee")} className="text-sky-600"><CalendarClock size={18}/></button>
                  <button title="En cours"   onClick={()=>changeStatut(i.id,"en_cours")}  className="text-yellow-600"><PlayCircle size={18}/></button>
                  <button title="Terminée"   onClick={()=>changeStatut(i.id,"terminee")}   className="text-green-600"><CheckCircle2 size={18}/></button>
                  <button title="Annuler"    onClick={()=>changeStatut(i.id,"annulee")}    className="text-gray-500"><XCircle size={18}/></button>
                  <button title="Supprimer"  onClick={()=>remove(i.id)}                 className="text-red-600"><Trash size={18}/></button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={7} className="p-6 text-center text-gray-500 italic">Aucune intervention</td></tr>
          )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pages>1 &&
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button disabled={page===1}     onClick={()=>setPage(p=>p-1)} className="disabled:opacity-40"><ChevronsLeft/></button>
          <span>Page {page}/{pages}</span>
          <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className="disabled:opacity-40"><ChevronsRight/></button>
        </div>
      }

      {/* modal création */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">Nouvelle intervention</Dialog.Title>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <select value={form.borne_id} onChange={e=>setForm({...form, borne_id:e.target.value})}
                        className="col-span-2 border px-3 py-2 rounded">
                  <option value="">— Sélectionner une borne —</option>
                  {bornes.map(b =>
                    <option key={b.id} value={b.id}>{b.nom || b.id.slice(0,8)}</option>
                  )}
                </select>

                <select value={form.type_intervention}
                        onChange={e=>setForm({...form,type_intervention:e.target.value})}
                        className="col-span-2 border px-3 py-2 rounded">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>

                <input type="date" value={form.date_intervention}
                       onChange={e=>setForm({...form,date_intervention:e.target.value})}
                       className="col-span-1 border px-3 py-2 rounded"/>

                <input placeholder="Intervenant" value={form.intervenant}
                       onChange={e=>setForm({...form,intervenant:e.target.value})}
                       className="col-span-1 border px-3 py-2 rounded"/>

                <textarea rows={3} placeholder="Description"
                          value={form.description}
                          onChange={e=>setForm({...form,description:e.target.value})}
                          className="col-span-2 border px-3 py-2 rounded resize-none"/>

                <select value={form.statut}
                        onChange={e=>setForm({...form,statut:e.target.value})}
                        className="col-span-2 border px-3 py-2 rounded">
                  {Object.entries(STATUTS).map(([k,v]) =>
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
