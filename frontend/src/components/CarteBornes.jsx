// src/components/CarteBornes.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
});

function AutoZoom({ bornes }) {
  const map = useMap();

  useEffect(() => {
    if (bornes.length > 0) {
      const bounds = bornes.map((b) => [b.latitude, b.longitude]);
      map.fitBounds(bounds);
    }
  }, [bornes, map]);

  return null;
}

export default function CarteBornes({ bornes = [], enableZoom = false, enableFilters = false }) {
  const [filtered, setFiltered] = useState(bornes);
  const [filtre, setFiltre] = useState("all");

  useEffect(() => {
    if (filtre === "online") {
      setFiltered(bornes.filter((b) => b.status === "online"));
    } else if (filtre === "offline") {
      setFiltered(bornes.filter((b) => b.status === "offline"));
    } else {
      setFiltered(bornes);
    }
  }, [filtre, bornes]);

  return (
    <div className="w-full h-[400px] rounded shadow overflow-hidden">
      {enableFilters && (
        <div className="flex gap-2 mb-2 p-2 bg-white rounded-t shadow-sm z-[1000] relative">
          <button onClick={() => setFiltre("all")} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Tous</button>
          <button onClick={() => setFiltre("online")} className="px-2 py-1 bg-green-100 rounded hover:bg-green-200">En ligne</button>
          <button onClick={() => setFiltre("offline")} className="px-2 py-1 bg-red-100 rounded hover:bg-red-200">Hors ligne</button>
        </div>
      )}

      <MapContainer center={[0.5, 25]} zoom={5} className="w-full h-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {enableZoom && <AutoZoom bornes={filtered} />}
        {filtered.map((borne) => (
          <Marker
            key={borne.id}
            position={[borne.latitude, borne.longitude]}
            icon={customIcon}
          >
            <Popup>
              <strong>{borne.nom}</strong><br />
              État: {borne.status} <br />
              Niveau: {borne.niveau ?? '-'} % <br />
              Humidité: {borne.humidite ?? '-'} %
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
