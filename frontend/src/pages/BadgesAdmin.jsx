/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, Fragment } from "react";
import toast from "react-hot-toast";
import {
  Plus, RefreshCw, Edit, Trash,
  ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import axiosInstance from "../api/axiosInstance"; // ✅ utilise ton instance configurée

/* -------------------------------------------------------------------- */
export default function BadgesAdmin() {
  /* ───────────── state global ───────────── */
  const [badges, setBadges] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(badges.length / perPage));
  const slice = badges.slice((page - 1) * perPage, page * perPage);

  /* ───────────── modal + form ───────────── */
  const [open, setOpen] = useState(false);
  const [editId, setEdit] = useState(null);
  const [form, setForm] = useState({
    nom: "", description: "", image_url: "",
    condition_type: "", condition_value: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUp] = useState(false);

  /* ───────────── fetch ───────────── */
  useEffect(() => { void load(); }, []);
  async function load() {
    try {
      const { data } = await axiosInstance.get("/badges");
      setBadges(data);
    } catch {
      toast.error("Impossible de charger les badges");
    }
  }

  /* ───────────── helpers ───────────── */
  function resetForm() {
    setForm({ nom:"", description:"", image_url:"", condition_type:"", condition_value:"" });
    setFile(null);
    setEdit(null);
  }

  /** 🔼 Upload de l'image si un fichier a été choisi */
  async function maybeUpload() {
    if (!file) return form.image_url; // rien à uploader
    try {
      setUp(true);
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axiosInstance.post("/upload/badge", fd, {
        headers: { "Content-Type":"multipart/form-data" }
      });
      toast.success("Image envoyée ✔️");
      return data.imageUrl; // ← /uploads/badges/xxx.png
    } catch (e) {
      toast.error("Échec upload image");
      throw e;
    } finally { setUp(false); }
  }

  /** 💾 Création / édition */
  async function save() {
    try {
      const image_url = await maybeUpload(); // peut lever une erreur
      const payload = { ...form, image_url };

      const method = editId ? "put"  : "post";
      const url = editId ? `/badges/${editId}` : "/badges";

      const { data } = await axiosInstance[method](url, payload);

      toast.success(editId ? "Badge mis à jour" : "Badge créé");

      setBadges(b =>
        editId ? b.map(x => x.id === editId ? data : x) : [data, ...b]
      );

      setOpen(false);
      resetForm();
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur d’enregistrement");
    }
  }

  async function remove(id) {
    if (!window.confirm("Supprimer ce badge ?")) return;
    try {
      await axiosInstance.delete(`/badges/${id}`);
      setBadges(b => b.filter(x => x.id !== id));
      toast.success("Badge supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  }

  /* -------------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Badges</h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow"
            onClick={() => { resetForm(); setOpen(true); }}
          >
            <Plus size={16}/> Nouveau
          </button>
          <button className="p-1.5 border rounded hover:bg-gray-50" onClick={load}>
            <RefreshCw size={16}/>
          </button>
        </div>
      </header>

      {/* Tableau */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm rounded shadow">
          <thead className="bg-gray-50/75 backdrop-blur">
            <tr className="text-xs uppercase tracking-wider text-gray-600">
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Condition</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {slice.length ? slice.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="p-3 border">
                  {b.image_url
                    ? <img src={b.image_url} alt="" className="h-8 w-8 object-contain"/>
                    : "—"}
                </td>
                <td className="p-3 border font-medium">{b.nom}</td>
                <td className="p-3 border">{b.description}</td>
                <td className="p-3 border">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {b.condition_type} : {b.condition_value}
                  </span>
                </td>
                <td className="p-3 border">
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => { setForm(b); setEdit(b.id); setOpen(true); }}
                    >
                      <Edit size={18}/>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => remove(b.id)}
                    >
                      <Trash size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500 italic">Aucun badge</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 &&
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="disabled:opacity-40 hover:text-green-700"><ChevronsLeft/></button>
          <span>Page {page}/{pages}</span>
          <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className="disabled:opacity-40 hover:text-green-700"><ChevronsRight/></button>
        </div>
      }

      {/* Modal */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => { if(!uploading) setOpen(false); }}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                {editId ? "Modifier le badge" : "Nouveau badge"}
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
                  rows={3}
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                {/* Image : URL + upload */}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    className="flex-1 border px-3 py-2 rounded"
                    placeholder="Image URL (auto-rempli après upload)"
                    value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                  />
                  <input
                    type="file" accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                </div>

                <input
                  className="border px-3 py-2 rounded"
                  placeholder="Condition type"
                  value={form.condition_type}
                  onChange={e => setForm({ ...form, condition_type: e.target.value })}
                />
                <input
                  className="border px-3 py-2 rounded"
                  placeholder="Condition value"
                  value={form.condition_value}
                  onChange={e => setForm({ ...form, condition_value: e.target.value })}
                />
              </div>

              <button
                disabled={uploading}
                onClick={save}
                className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
              >
                {uploading ? "Envoi image…" : editId ? "Mettre à jour" : "Créer"}
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
