/* src/pages/AlertesAdmin.jsx */
import { useEffect, useState, Fragment } from "react";
import toast from "react-hot-toast";
import { CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { initSocket } from "../socket"; 
import axiosInstance from "../api/axiosInstance"; // ✅ on utilise axiosInstance

const COULEURS = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-700",
};

export default function AlertesAdmin() {
  const [alertes, setAlertes] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();

    // ✅ init socket
    const socket = initSocket();

    socket.on("connect", () => console.log("✅ Socket connecté", socket.id));
    socket.on("disconnect", () => console.log("🔴 Socket déconnecté", socket.id));

    socket.on("new_alerte", (alerte) => {
      toast.success("Nouvelle alerte reçue");
      setAlertes((prev) => [alerte, ...prev]);
    });

    socket.on("alerte_resolue", (alerte) => {
      setAlertes((prev) => prev.map((a) => (a.id === alerte.id ? alerte : a)));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_alerte");
      socket.off("alerte_resolue");
      socket.disconnect();
    };
  }, []);

  async function load() {
    try {
      const { data } = await axiosInstance.get("/alerte-borne"); // ✅ appel via axiosInstance
      setAlertes(data);
    } catch {
      toast.error("Erreur chargement alertes");
    }
  }

  async function marquerResolue(id) {
    try {
      await axiosInstance.patch(`/alerte-borne/${id}/resolve`); // ✅ appel via axiosInstance
      toast.success("Alerte résolue");
    } catch {
      toast.error("Erreur résolution");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Alertes</h1>
        <button onClick={load} className="p-1.5 border rounded hover:bg-gray-50">
          <RefreshCw size={16} />
        </button>
      </header>

      <div className="space-y-3">
        {alertes.map((a) => (
          <div
            key={a.id}
            className={`p-4 border rounded shadow-sm ${
              COULEURS[a.niveau] || "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setSelected(a)}
          >
            <div className="flex justify-between">
              <strong>{a.type_alerte}</strong>
              {!a.est_resolue && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    marquerResolue(a.id);
                  }}
                  className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
                >
                  <CheckCircle size={14} /> Résoudre
                </button>
              )}
            </div>
            <p className="text-sm mt-1">{a.message}</p>
            <p className="text-xs mt-1 italic text-gray-500">
              Créée le {new Date(a.created_at).toLocaleString()}{" "}
              {a.est_resolue && ` - Résolue`}
            </p>
          </div>
        ))}
      </div>

      {/* Drawer Détails */}
      <Transition show={!!selected} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelected(null)}>
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

          <div className="fixed inset-0 flex justify-end">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 shadow-lg overflow-y-auto">
              {selected && (
                <>
                  <Dialog.Title className="text-lg font-semibold mb-2">
                    Détails de l’alerte
                  </Dialog.Title>
                  <p>
                    <strong>Type :</strong> {selected.type_alerte}
                  </p>
                  <p>
                    <strong>Message :</strong> {selected.message}
                  </p>
                  <p>
                    <strong>Niveau :</strong> {selected.niveau}
                  </p>
                  <p>
                    <strong>Borne ID :</strong> {selected.borne_id}
                  </p>
                  <p>
                    <strong>Créé le :</strong>{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                  {selected.est_resolue && (
                    <p>
                      <strong>Résolue le :</strong>{" "}
                      {new Date(selected.resolved_at).toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
