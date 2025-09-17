// src/pages/BornesAdmin.jsx
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { Pencil, PlusCircle } from "lucide-react";
import { initSocket } from "../socket";

const API = "http://localhost:5000/api/borne";
const PAYS_API = "http://localhost:5000/api/pays";
const VILLE_API = "http://localhost:5000/api/villes";
const COMMUNE_API = "http://localhost:5000/api/commune";
const QUARTIER_API = "http://localhost:5000/api/quartiers";
const CLIENT_API = "http://localhost:5000/api/clients";

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function BornesAdmin() {
  const [bornes, setBornes] = useState([]);
  const [paysList, setPaysList] = useState([]);
  const [villesList, setVillesList] = useState([]);
  const [communesList, setCommunesList] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalAddOpen, setModalAddOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Filtres
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    statut: "",
  });

  const [form, setForm] = useState({
    code: "",
    nom: "",
    type: "publique",
    statut: "active",
    pays_id: "",
    ville_id: "",
    commune_id: "",
    quartier_id: "",
    mode_acquisition: "",
    date_installation: "",
    client_id: "",
  });

  useEffect(() => {
    const socket = initSocket();
    loadBornes();
    loadPays();
    loadClients();

    const handleBorneAjoutee = (b) => setBornes((prev) => [...prev, b]);
    const handleBorneModifiee = (b) =>
      setBornes((prev) => prev.map((item) => (item.id === b.id ? b : item)));
    const handleBorneSupprimee = ({ id }) =>
      setBornes((prev) => prev.filter((item) => item.id !== id));

    socket.on("borne_ajoutee", handleBorneAjoutee);
    socket.on("borne_modifiee", handleBorneModifiee);
    socket.on("borne_supprimee", handleBorneSupprimee);

    return () => {
      socket.off("borne_ajoutee", handleBorneAjoutee);
      socket.off("borne_modifiee", handleBorneModifiee);
      socket.off("borne_supprimee", handleBorneSupprimee);
    };
  }, []);

  async function loadBornes() {
    try {
      const { data } = await axios.get(API, { headers: authH() });
      setBornes(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPays() {
    try {
      const { data } = await axios.get(PAYS_API, { headers: authH() });
      setPaysList(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadVilles(pays_id) {
    try {
      if (!pays_id) {
        setVillesList([]);
        return;
      }
      const { data } = await axios.get(`${VILLE_API}?pays_id=${pays_id}`, {
        headers: authH(),
      });
      setVillesList(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadCommunes(ville_id) {
    try {
      if (!ville_id) {
        setCommunesList([]);
        return;
      }
      const { data } = await axios.get(`${COMMUNE_API}?ville_id=${ville_id}`, {
        headers: authH(),
      });
      setCommunesList(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadQuartiers(commune_id) {
    try {
      if (!commune_id) {
        setQuartiers([]);
        return;
      }
      const { data } = await axios.get(
        `${QUARTIER_API}/by-commune?commune_id=${commune_id}`,
        { headers: authH() }
      );
      setQuartiers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadClients() {
    try {
      const { data } = await axios.get(CLIENT_API, { headers: authH() });
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveUpdate() {
    try {
      await axios.put(`${API}/${selected.id}`, form, { headers: authH() });
      setSelected(null);
      setModalAddOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveNew() {
    try {
      const payload = {
        ...form,
        quartier_id: form.quartier_id || null,
        client_id: form.client_id || null,
      };
      console.log("Payload envoyé :", payload);
      await axios.post(API, payload, { headers: authH() });
      setModalAddOpen(false);
      setForm({
        code: "",
        nom: "",
        type: "publique",
        statut: "active",
        pays_id: "",
        ville_id: "",
        commune_id: "",
        quartier_id: "",
        mode_acquisition: "",
        date_installation: "",
        client_id: "",
      });
    } catch (error) {
      console.error("Erreur:", error.response?.data || error.message);
    }
  }

  // Filtrage appliqué
  const filteredBornes = bornes.filter((b) => {
    return (
      (filters.search === "" ||
        b.code?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.nom?.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.statut === "" || b.statut === filters.statut) &&
      (filters.type === "" || b.type === filters.type)
    );
  });

  // Pagination appliquée
  const totalPages = Math.ceil(filteredBornes.length / perPage);
  const paginatedBornes = filteredBornes.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Gestion des bornes</h1>
        <button
          onClick={() => setModalAddOpen(true)}
          className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <PlusCircle size={16} className="mr-1" /> Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Rechercher par code ou nom..."
          className="border rounded px-3 py-2 w-1/3"
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            setPage(1);
          }}
        />
        <select
          className="border rounded px-3 py-2"
          value={filters.statut}
          onChange={(e) => {
            setFilters({ ...filters, statut: e.target.value });
            setPage(1);
          }}
        >
          <option value="">-- Tous les statuts --</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value });
            setPage(1);
          }}
        >
          <option value="">-- Tous les types --</option>
          <option value="publique">Publique</option>
          <option value="ecole">École</option>
          <option value="entreprise">Entreprise</option>
        </select>
      </div>

      <div className="overflow-x-auto ring-1 ring-gray-200 shadow rounded-lg">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase text-start">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Type</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Pays</th>
              <th className="p-3">Ville</th>
              <th className="p-3">Commune</th>
              <th className="p-3">Quartier</th>
              <th className="p-3">Humidité</th>
              <th className="p-3">Remplissage</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedBornes.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 text-start">
                <td className="p-3">{b.code}</td>
                <td className="p-3">{b.nom}</td>
                <td className="p-3">{b.type}</td>
                <td className="p-3">{b.statut}</td>
                <td className="p-3">{b.pays_nom}</td>
                <td className="p-3">{b.ville_nom}</td>
                <td className="p-3">{b.commune_nom}</td>
                <td className="p-3">{b.quartier_nom}</td>
                <td className="p-3">{b.humidite ?? "—"}</td>
                <td className="p-3">{b.niveau_remplissage ?? "—"}%</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setSelected(b);
                      setForm({
                        code: b.code,
                        nom: b.nom,
                        type: b.type,
                        statut: b.statut,
                        pays_id: b.pays_id,
                        ville_id: b.ville_id,
                        commune_id: b.commune_id,
                        quartier_id: b.quartier_id,
                        mode_acquisition: b.mode_acquisition,
                        date_installation: b.date_installation,
                        client_id: b.client_id,
                      });
                      loadVilles(b.pays_id);
                      loadCommunes(b.ville_id);
                      loadQuartiers(b.commune_id);
                      setModalAddOpen(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Page {page} sur {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal d'ajout/modif */}
      <Transition show={modalAddOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setModalAddOpen(false);
            setSelected(null);
          }}
        >
          <div className="fixed inset-0 flex justify-end">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 shadow-xl rounded-lg overflow-y-auto h-full">
              <Dialog.Title className="text-lg font-bold mb-4 text-gray-700">
                {selected ? "Modifier Borne" : "Ajouter une Borne"}
              </Dialog.Title>

              <div className="space-y-5 text-sm">
                {/* Informations générales */}
                <div className="bg-gray-50 p-3 rounded border">
                  <h2 className="font-semibold mb-2 text-gray-600">
                    Informations générales
                  </h2>
                  <input
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Code"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                  />
                  <input
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Nom"
                    value={form.nom}
                    onChange={(e) =>
                      setForm({ ...form, nom: e.target.value })
                    }
                  />

                  <select
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                  >
                    <option value="publique">Publique</option>
                    <option value="ecole">École</option>
                    <option value="entreprise">Entreprise</option>
                  </select>

                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.statut}
                    onChange={(e) =>
                      setForm({ ...form, statut: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Localisation */}
                <div className="bg-gray-50 p-3 rounded border">
                  <h2 className="font-semibold mb-2 text-gray-600">
                    Localisation
                  </h2>
                  <select
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={form.pays_id}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        pays_id: e.target.value,
                        ville_id: "",
                        commune_id: "",
                        quartier_id: "",
                      });
                      loadVilles(e.target.value);
                    }}
                  >
                    <option value="">-- Sélectionner un pays --</option>
                    {paysList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={form.ville_id}
                    disabled={!form.pays_id}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        ville_id: e.target.value,
                        commune_id: "",
                        quartier_id: "",
                      });
                      loadCommunes(e.target.value);
                    }}
                  >
                    <option value="">-- Sélectionner une ville --</option>
                    {villesList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nom}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={form.commune_id}
                    disabled={!form.ville_id}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        commune_id: e.target.value,
                        quartier_id: "",
                      });
                      loadQuartiers(e.target.value);
                    }}
                  >
                    <option value="">-- Sélectionner une commune --</option>
                    {communesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.quartier_id}
                    disabled={!form.commune_id}
                    onChange={(e) =>
                      setForm({ ...form, quartier_id: e.target.value })
                    }
                  >
                    <option value="">-- Sélectionner un quartier --</option>
                    {quartiers.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Détails supplémentaires */}
                <div className="bg-gray-50 p-3 rounded border">
                  <h2 className="font-semibold mb-2 text-gray-600">
                    Détails supplémentaires
                  </h2>
                  <input
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Mode acquisition"
                    value={form.mode_acquisition}
                    onChange={(e) =>
                      setForm({ ...form, mode_acquisition: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={form.date_installation}
                    onChange={(e) =>
                      setForm({ ...form, date_installation: e.target.value })
                    }
                  />
                  <select
                    className="w-full border rounded px-3 py-2 mb-2"
                    value={form.client_id}
                    onChange={(e) =>
                      setForm({ ...form, client_id: e.target.value })
                    }
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={selected ? saveUpdate : saveNew}
                className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
              >
                {selected ? "Enregistrer" : "Ajouter"}
              </button>
              <button
                onClick={() => {
                  setModalAddOpen(false);
                  setSelected(null);
                }}
                className="mt-2 w-full text-sm text-gray-500"
              >
                Fermer
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
