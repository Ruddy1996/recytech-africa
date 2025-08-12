import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Pencil, XCircle } from 'lucide-react';

const API = "http://localhost:5000/api/borne";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function BornesAdmin() {
  const [bornes, setBornes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nom: '', commune: '', latitude: '', longitude: '' });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await axios.get("http://localhost:5000/api/bornes-status", { headers: authH() });
      setBornes(data);
    } catch (err) {
      console.error("Erreur chargement bornes", err);
    }
  }

  async function save() {
    try {
      await axios.put(`${API}/${selected.borne_id}`, form, { headers: authH() });
      setSelected(null);
      load();
    } catch (err) {
      console.error("Erreur sauvegarde", err);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Gestion des bornes</h1>

      <div className="overflow-x-auto ring-1 ring-gray-200 shadow rounded-lg">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Commune</th>
              <th className="p-3 text-left">Latitude</th>
              <th className="p-3 text-left">Longitude</th>
              <th className="p-3 text-left">Humidité</th>
              <th className="p-3 text-left">Remplissage</th>
              <th className="p-3 text-left">En ligne</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bornes.map(b => (
              <tr key={b.borne_id} className="hover:bg-gray-50">
                <td className="p-3">{b.nom}</td>
                <td className="p-3">{b.commune}</td>
                <td className="p-3">{b.latitude}</td>
                <td className="p-3">{b.longitude}</td>
                <td className="p-3">{b.humidite ?? '—'}</td>
                <td className="p-3">{b.niveau_remplissage ?? '—'} %</td>
                <td className="p-3">{b.est_connectee ? '✅' : '❌'}</td>
                <td className="p-3 text-right">
                  <button onClick={() => {
                    setSelected(b);
                    setForm({
                      nom: b.nom,
                      commune: b.commune,
                      latitude: b.latitude,
                      longitude: b.longitude
                    });
                  }} className="text-blue-600 hover:underline">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Transition show={!!selected} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelected(null)}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-0 flex justify-end">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-4">Modifier Borne</Dialog.Title>
              <div className="space-y-3 text-sm">
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Commune"
                  value={form.commune}
                  onChange={e => setForm({ ...form, commune: e.target.value })}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={e => setForm({ ...form, latitude: e.target.value })}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={e => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
              <button onClick={save} className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                Enregistrer
              </button>
              <button onClick={() => setSelected(null)} className="mt-2 w-full text-gray-500 text-sm hover:underline">
                <XCircle size={16} className="inline mr-1" /> Fermer
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
