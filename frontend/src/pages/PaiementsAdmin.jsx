/* src/pages/PaiementsAdmin.jsx */
import { useEffect, useState, Fragment }   from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import {
  RefreshCw, ChevronsLeft, ChevronsRight, Info
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const BADGE = {
  en_attente : "bg-yellow-100 text-yellow-700",
  valide     : "bg-green-100  text-green-700",
  échoué     : "bg-red-100    text-red-700"
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function PaiementsAdmin() {
  /* --------------- state --------------- */
  const [rows,  setRows]  = useState([]);
  const [page,  setPage]  = useState(1);
  const [pages, setPages] = useState(1);
  const [f,     setF]     = useState({ q:"", status:"all" });

  /* --------------- détail modal --------------- */
  const [open, setOpen]   = useState(false);
  const [current, setCur] = useState(null);

  /* --------------- fetch --------------- */
  useEffect(() => { load(); }, [page, f]);

  async function load(){
    try{
      const { data, headers } = await axiosInstance.get('paiements-abonnements', {
        params : { page, q:f.q, status:f.status }
      });
      setRows(data);
      setPages(Number(headers["x-total-pages"] || 1));
    }catch{
      toast.error("Impossible de charger les paiements");
    }
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* header -------------------------------------------------------- */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Historique des paiements</h1>

        <div className="flex items-center gap-3">
          <input
            placeholder="Recherche (client / transaction)…"
            value={f.q}
            onChange={e=>{ setF({...f, q:e.target.value}); setPage(1); }}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
          <select
            value={f.status}
            onChange={e=>{ setF({...f, status:e.target.value}); setPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">Tous statuts</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Validé</option>
            <option value="échoué">Échoué</option>
          </select>

          <button
            onClick={load}
            className="p-1.5 border rounded hover:bg-gray-50"
            title="Rafraîchir"
          >
            <RefreshCw size={16}/>
          </button>
        </div>
      </header>

      {/* table --------------------------------------------------------- */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm rounded shadow">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider  text-gray-600">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Transaction</th>
              <th className="p-3 text-left">Abonnement</th>
              <th className="p-3 text-left">Montant (CDF)</th>
              <th className="p-3  text-left">Statut</th>
              <th className="p-3 text-left"> </th>
            </tr>
          </thead>

          <tbody className="divide-y">
          {rows.length ? rows.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="p-3 border whitespace-nowrap">
                {new Date(p.date_paiement).toLocaleString()}
              </td>
              <td className="p-3 border font-mono">{p.transaction_id}</td>
              <td className="p-3 border">{p.organisation_nom || '—'}</td>
              <td className="p-3 border text-right">{p.montant.toLocaleString()}</td>
              <td className="p-3 border text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[p.status]}`}>
                  {p.status.replace('_',' ')}
                </span>
              </td>
              <td className="p-3 border">
                <button
                  onClick={()=>{setCur(p); setOpen(true);}}
                  className="text-blue-600 hover:text-blue-800"
                  title="Détails"
                >
                  <Info size={18}/>
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={6}
                    className="p-6 text-center text-gray-500 italic">Aucun paiement</td></tr>
          )}
          </tbody>
        </table>
      </div>

      {/* pagination ---------------------------------------------------- */}
      {pages>1 &&
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button disabled={page===1}
                  onClick={()=>setPage(p=>p-1)}
                  className="disabled:opacity-40">
            <ChevronsLeft/>
          </button>
          <span>Page {page}/{pages}</span>
          <button disabled={page===pages}
                  onClick={()=>setPage(p=>p+1)}
                  className="disabled:opacity-40">
            <ChevronsRight/>
          </button>
        </div>
      }

      {/* modal détail -------------------------------------------------- */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl text-sm">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Détails du paiement
              </Dialog.Title>

              {current && (
                <div className="space-y-2">
                  <p><b>Transaction :</b> <span className="font-mono">{current.transaction_id}</span></p>
                  <p><b>Abonnement :</b> {current.organisation_nom || '—'} ({current.abonnement_id})</p>
                  <p><b>Montant :</b> {current.montant.toLocaleString()} CDF</p>
                  <p><b>Statut :</b> {current.status}</p>
                  <p><b>Date :</b> {new Date(current.date_paiement).toLocaleString()}</p>
                  {current.message && <p className="text-gray-600"><b>Message:</b> {current.message}</p>}
                </div>
              )}

              <button
                onClick={()=>setOpen(false)}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                Fermer
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
