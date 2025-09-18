/* src/pages/ClientsAdmin.jsx */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
  Plus,
  RefreshCw,
  Pencil,
  Trash,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const API = 'http://localhost:5000/api/clients';
const auth = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function ClientsAdmin() {
  /* ─────────── state ─────────── */
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotal] = useState(1);

  /* filtres */
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  /* modal formulaire */
  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const empty = {
    nom: '',
    email: '',
    telephone: '',
    type: 'Entreprise',
    localisation: '',
  };
  const [form, setForm] = useState(empty);
  const [currentId, setCurrentId] = useState(null);

  /* ─────────── fetch list ─────────── */
  useEffect(() => {
    fetchClients();
  }, [page, q, typeFilter]);

  const fetchClients = async () => {
    try {
      const { data, headers } = await axios.get(API, {
        params: {
          page,
          q,
          type: typeFilter !== 'all' ? typeFilter : undefined,
        },
        headers: auth(),
      });
      setClients(data);
      setTotal(Number(headers['x-total-pages'] || 1));
    } catch {
      toast.error("Impossible de charger la liste d’utilisateurs");
    }
  };

  /* ─────────── CRUD helpers ─────────── */
  const openCreate = () => {
    setIsEdit(false);
    setForm(empty);
    setOpenForm(true);
  };

  const openEdit = (c) => {
    setIsEdit(true);
    setCurrentId(c.id);
    setForm({
      nom: c.nom,
      email: c.email,
      telephone: c.telephone,
      type: c.type,
      localisation: c.localisation,
    });
    setOpenForm(true);
  };

  const saveClient = async () => {
    const method = isEdit ? 'put' : 'post';
    const url = isEdit ? `${API}/${currentId}` : API;
    try {
      const { data } = await axios[method](url, form, { headers: auth() });
      if (isEdit) {
        setClients((prev) => prev.map((c) => (c.id === currentId ? data : c)));
        toast.success('Client mis à jour');
      } else {
        setClients((prev) => [data, ...prev]);
        toast.success('Client créé 🎉');
      }
      setOpenForm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: auth() });
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success('Client supprimé');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ─────────── Header ─────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestion des clients</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Recherche (nom, email)…"
              className="border border-gray-300 rounded pl-8 pr-2 py-1 text-sm focus:ring-2 focus:ring-green-600 outline-none"
            />
            <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="all">Type : Tous</option>
            <option value="Particulier">Particulier</option>
            <option value="Entreprise">Entreprise</option>
            <option value="Collectivité">Collectivité</option>
            <option value="ecole">Ecole</option>
          </select>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow"
          >
            <Plus size={16} /> Ajouter
          </button>

          <button
            onClick={fetchClients}
            className="bg-white border border-gray-300 p-1.5 rounded hover:bg-gray-50 shadow-sm"
            title="Rafraîchir"
          >
            <RefreshCw size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* ─────────── Table ─────────── */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider text-gray-600">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Téléphone</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Localisation</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {clients.length ? (
              clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">{c.nom}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.telephone || '—'}</td>
                  <td className="p-3">{c.type}</td>
                  <td className="p-3">{c.localisation || '—'}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 italic">
                  Aucun client
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────── Pagination ─────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-5 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="disabled:opacity-40 hover:text-green-700"
          >
            <ChevronsLeft />
          </button>
          <span>
            Page <strong>{page}</strong> sur {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-40 hover:text-green-700"
          >
            <ChevronsRight />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */
      /* Modal Formulaire                                                  */
      /* ---------------------------------------------------------------- */}
      <Transition appear show={openForm} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpenForm}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-4">
                {isEdit ? 'Modifier le client' : 'Ajouter un client'}
              </Dialog.Title>

              <div className="space-y-3">
                {['nom', 'email', 'telephone', 'localisation'].map((field) => (
                  <input
                    key={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                ))}

                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Particulier">Particulier</option>
                  <option value="Entreprise">Entreprise</option>
                  <option value="Collectivité">Collectivité</option>
                  <option value="ecole">Ecole</option>
                </select>

                <button
                  onClick={saveClient}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2"
                >
                  {isEdit ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
