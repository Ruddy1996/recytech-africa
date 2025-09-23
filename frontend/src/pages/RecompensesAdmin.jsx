import { useEffect, useState, Fragment, useRef } from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";
import {
  Plus, RefreshCw, Edit, Trash,
  ChevronsLeft, ChevronsRight, Upload as UploadIcon, X
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

/* -------------------------------------------------------------------- */
const API_RECOMP  = "http://localhost:5000/api/recompense";
const API_UPLOAD  = "http://localhost:5000/api/upload";
const authHeader  = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const emptyForm = {
  titre: "", description: "", points_requis: "",
  stock: "", actif: true,
  type: "", categorie: "", partenaire: "",
  valid_from: "", valid_to: "",
  image_url: ""
};

/* -------------------------------------------------------------------- */
export default function RecompensesAdmin() {
  /* ─────────── state ─────────── */
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const list = rows.slice((page - 1) * perPage, page * perPage);

  /* modal + form */
  const [open, setOpen]   = useState(false);
  const [editId, setEdit] = useState(null);
  const [form, setForm]   = useState(emptyForm);
  const fileInput = useRef(null);

  /* ─────────── fetch ─────────── */
  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const { data } = await axiosInstance.get("/recompense");
      setRows(data);
    } catch {
      toast.error("Impossible de charger les récompenses");
    }
  }

  /* ─────────── helpers ─────────── */
  function reset() { setForm(emptyForm); setEdit(null); }

  async function save() {
    if (!form.titre.trim() || !form.points_requis) {
      toast.error("Titre et points sont requis"); return;
    }
    try {
      const method = editId ? "put" : "post";
      const url    = editId ? `/recompense/${editId}` : API_RECOMP;
      await axiosInstance[method](url, form);

      toast.success(editId ? "Récompense mise à jour" : "Récompense créée");
      setOpen(false); reset(); load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur d’enregistrement");
    }
  }

  async function remove(id) {
    if (!window.confirm("Supprimer cette récompense ?")) return;
    try {
      await axiosInstance.delete(`/recompense/${id}`);
      setRows(r => r.filter(x => x.id !== id));
      toast.success("Supprimé");
    } catch { toast.error("Suppression impossible"); }
  }

  /* --------- upload image --------- */
  async function handleUpload(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
    const { data } = await axiosInstance.post("/upload", fd, {
      headers: { 
        ...authHeader(), 
        "Content-Type": "multipart/form-data" 
      }
    });
      setForm(f => ({ ...f, image_url: data.url }));
      toast.success("Image envoyée");
    } catch {
      toast.error("Échec upload image");
    }
  }

  function onFileChange(e) { handleUpload(e.target.files[0]); }
  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);
  }

  /* -------------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Récompenses</h1>
        <div className="flex gap-3">
          <button
            onClick={() => { reset(); setOpen(true);} }
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow">
            <Plus size={16}/> Ajouter
          </button>
          <button onClick={load} className="p-1.5 border rounded hover:bg-gray-50">
            <RefreshCw size={16}/>
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Titre</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Période</th>
              <th className="p-3 text-left">Actif</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.length ? list.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-3">
                  {r.image_url
                    ? <img src={r.image_url} alt="" className="h-10 w-10 object-cover rounded"/>
                    : "—"}
                </td>
                <td className="p-3 font-medium">{r.titre}</td>
                <td className="p-3">{r.points_requis}</td>
                <td className="p-3">{r.stock ?? "—"}</td>
                <td className="p-3">{r.valid_from} → {r.valid_to || "∞"}</td>
                <td className="p-3">{r.actif ? "✅" : "⛔"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button className="text-blue-600" title="Modifier"
                      onClick={() => { setForm(r); setEdit(r.id); setOpen(true); }}>
                      <Edit size={18}/>
                    </button>
                    <button className="text-red-600" title="Supprimer"
                      onClick={() => remove(r.id)}>
                      <Trash size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500 italic">Aucune récompense</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pages>1 &&
        <div className="flex justify-center gap-4 mt-5 text-sm">
          <button disabled={page===1}    onClick={() => setPage(p => p-1)} className="disabled:opacity-40"><ChevronsLeft/></button>
          <span>Page {page}/{pages}</span>
          <button disabled={page===pages} onClick={() => setPage(p => p+1)} className="disabled:opacity-40"><ChevronsRight/></button>
        </div>
      }

      {/* modal form */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40"/>
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                {editId ? "Modifier la récompense" : "Nouvelle récompense"}
              </Dialog.Title>

              {/* formulaire */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* colonne gauche */}
                <div className="space-y-3 col-span-1">
                  <input className="w-full border rounded px-3 py-2"
                         placeholder="Titre"
                         value={form.titre}
                         onChange={e=>setForm({...form,titre:e.target.value})}/>
                  <textarea rows={3} className="w-full border rounded px-3 py-2 resize-none"
                            placeholder="Description"
                            value={form.description}
                            onChange={e=>setForm({...form,description:e.target.value})}/>
                  <input className="w-full border rounded px-3 py-2"
                         placeholder="Points requis"
                         type="number" min="0"
                         value={form.points_requis}
                         onChange={e=>setForm({...form,points_requis:e.target.value})}/>
                  <input className="w-full border rounded px-3 py-2"
                         placeholder="Stock"
                         type="number" min="0"
                         value={form.stock}
                         onChange={e=>setForm({...form,stock:e.target.value})}/>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="actif" checked={form.actif}
                           onChange={e=>setForm({...form,actif:e.target.checked})}/>
                    <label htmlFor="actif">Actif</label>
                  </div>
                </div>

                {/* colonne droite */}
                <div className="space-y-3 col-span-1">
                  <input className="w-full border rounded px-3 py-2"
                         placeholder="Type (ex: coupon, cadeau…)"
                         value={form.type}
                         onChange={e=>setForm({...form,type:e.target.value})}/>
                  <input className="w-full border rounded px-3 py-2"
                         placeholder="Catégorie"
                         value={form.categorie}
                         onChange={e=>setForm({...form,categorie:e.target.value})}/>
                  <input className="w-full border rounded px-3 py-2"
                         placeholder="Partenaire"
                         value={form.partenaire}
                         onChange={e=>setForm({...form,partenaire:e.target.value})}/>
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 border rounded px-3 py-2"
                           value={form.valid_from || ""} placeholder="Début"
                           onChange={e=>setForm({...form,valid_from:e.target.value})}/>
                    <input type="date" className="flex-1 border rounded px-3 py-2"
                           value={form.valid_to || ""} placeholder="Fin"
                           onChange={e=>setForm({...form,valid_to:e.target.value})}/>
                  </div>

                  {/* upload zone */}
                  <div
                    className="border-2 border-dashed rounded p-4 text-center cursor-pointer relative"
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInput.current?.click()}
                  >
                    {form.image_url
                      ? (
                        <div className="relative inline-block">
                          <img src={form.image_url} alt="" className="h-24 w-24 object-cover rounded"/>
                          <button
                            onClick={e => { e.stopPropagation(); setForm({...form,image_url:""}); }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5">
                            <X size={14}/>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-500">
                          <UploadIcon size={24}/>
                          <span className="text-xs">Glissez une image ou cliquez pour sélectionner</span>
                        </div>
                      )}
                    <input type="file" accept="image/*" hidden ref={fileInput} onChange={onFileChange}/>
                  </div>
                </div>
              </div>

              <button onClick={save}
                      className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                {editId ? "Mettre à jour" : "Créer"}
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
