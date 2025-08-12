/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, Fragment } from "react";
import axios     from "axios";
import toast     from "react-hot-toast";
import {
  Plus, RefreshCw, Trash,
  ToggleLeft, ToggleRight,
  ChevronsLeft, ChevronsRight,
  ScanLine
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const API        = "http://localhost:5000/api/users";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function UsersAdmin() {
  /* ─────────── state ─────────── */
  const [users, setUsers]         = useState([]);
  const [page,  setPage]          = useState(1);
  const [totalPages, setTotal]    = useState(1);
  const [q, setQ]                 = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser]       = useState({
    full_name: "", email: "", password: "", role: "User",
  });

  const [openNfc, setOpenNfc]   = useState(false);
  const [nfcUid,  setNfcUid]    = useState("");
  const [currentId, setCurrent] = useState(null);

  /* ─────────── fetch ─────────── */
  useEffect(() => { fetchUsers(); }, [page, q]);

  const fetchUsers = async () => {
    try {
      const { data, headers } = await axios.get(API, {
        params  : { page, q },
        headers : authHeader()
      });
      setUsers(data);                                // contient `active`
      setTotal(Number(headers["x-total-pages"] || 1));
    } catch {
      toast.error("Impossible de charger la liste d’utilisateurs");
    }
  };

  /* ─────────── actions ─────────── */
  const toggleActive = async (id, active) => {
    try {
      await axios.patch(
        `${API}/${id}/active`,
        { active: !active },
        { headers: authHeader() }
      );
      setUsers(prev =>
        prev.map(u => u.id === id ? { ...u, active: !active } : u)
      );
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Échec de la mise à jour du statut");
    }
  };

  const remove = async id => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: authHeader() });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("Utilisateur supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const createUser = async () => {
    try {
      const { data } = await axios.post(API, newUser, { headers: authHeader() });
      setUsers(p => [data, ...p]);
      setOpenCreate(false);
      setNewUser({ full_name: "", email: "", password: "", role: "User" });
      toast.success("Utilisateur créé 🎉");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création");
    }
  };

  const linkNfc = async () => {
    if (!nfcUid.trim()) return toast.error("Veuillez saisir l’UID");
    try {
      await axios.post(
        `${API}/${currentId}/link-nfc`,
        { nfc_uid: nfcUid },
        { headers: authHeader() }
      );
      setUsers(prev =>
        prev.map(u => u.id === currentId ? { ...u, nfc_uid: nfcUid } : u)
      );
      setOpenNfc(false);  setNfcUid("");
      toast.success("Carte NFC liée");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur de liaison NFC");
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ───────── Header ───────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>

        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Recherche…"
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-green-600 outline-none"
          />
          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow"
          >
            <Plus size={16}/> Ajouter
          </button>
          <button
            onClick={fetchUsers}
            className="bg-white border border-gray-300 p-1.5 rounded hover:bg-gray-50 shadow-sm"
            title="Rafraîchir"
          >
            <RefreshCw size={16} className="text-gray-600"/>
          </button>
        </div>
      </div>

      {/* ───────── Table ───────── */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 text-sm rounded shadow">
          <thead className="bg-gray-50/70 backdrop-blur text-xs font-semibold text-gray-700 uppercase">
            <tr className="text-xs uppercase tracking-wider  text-gray-600 border-b">
              {["Nom","Email","Rôle","Points","Actif","NFC","Actions"].map(h=>(
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {users.length ? (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 ">
                  <td className="px-4 py-2 whitespace-nowrap">{u.full_name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${u.role === "Admin"     ? "bg-purple-100 text-purple-700"
                        : u.role === "Autorite"  ? "bg-blue-100   text-blue-700"
                        :                          "bg-gray-100  text-gray-700"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{u.points ?? 0}</td>
                  <td className="px-4 py-2 text-center">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        • Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        • Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">{u.nfc_uid ? "✔️" : "—"}</td>

                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleActive(u.id, u.active)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Activer / Désactiver"
                      >
                        {u.active ? <ToggleRight/> : <ToggleLeft/>}
                      </button>

                      <button
                        onClick={() => { setCurrent(u.id); setOpenNfc(true); }}
                        className="text-purple-600 hover:text-purple-800"
                        title="Lier NFC"
                      >
                        <ScanLine/>
                      </button>

                      <button
                        onClick={() => remove(u.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 italic">
                  Aucun utilisateur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ───────── Pagination ───────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-5 text-sm">
          <button disabled={page===1}          onClick={()=>setPage(p=>p-1)} className="disabled:opacity-40 hover:text-green-700"><ChevronsLeft/></button>
          <span>Page <strong>{page}</strong> / {totalPages}</span>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="disabled:opacity-40 hover:text-green-700"><ChevronsRight/></button>
        </div>
      )}

      {/* ------------------------------------------------------------------
         Modal création utilisateur
      ------------------------------------------------------------------ */}
      <Transition show={openCreate} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpenCreate}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-4">Ajouter un utilisateur</Dialog.Title>

              <div className="space-y-3">
                {["full_name|Nom complet","email|Email","password|Mot de passe"].map(f=>{
                  const [name,placeholder] = f.split("|");
                  return (
                    <input key={name}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      type={name==="password"?"password":"text"}
                      placeholder={placeholder}
                      value={newUser[name]}
                      onChange={e=>setNewUser({...newUser,[name]:e.target.value})}
                    />
                  );
                })}
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={newUser.role}
                  onChange={e=>setNewUser({...newUser, role:e.target.value})}
                >
                  <option value="User">Utilisateur</option>
                  <option value="Autorite">Autorité</option>
                  <option value="Admin">Admin</option>
                </select>

                <button onClick={createUser}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-3">
                  Créer
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* ------------------------------------------------------------------
         Modal liaison NFC
      ------------------------------------------------------------------ */}
      <Transition show={openNfc} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpenNfc}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-4">Lier une carte NFC</Dialog.Title>

              <input
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
                placeholder="UID de la carte"
                value={nfcUid}
                onChange={e=>setNfcUid(e.target.value.trim())}
              />

              <button onClick={linkNfc}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded">
                Lier la carte
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
