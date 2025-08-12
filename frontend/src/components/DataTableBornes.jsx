// src/components/DataTableBornes.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import io from "socket.io-client";

export default function DataTableBornes({ bornes = [] }) {
  const [filteredBornes, setFilteredBornes] = useState(bornes);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("borne_updated", (updatedBorne) => {
      setFilteredBornes((prev) => {
        const index = prev.findIndex((b) => b.id === updatedBorne.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = updatedBorne;
          return applyFilters(updated);
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    setFilteredBornes(applyFilters(bornes));
  }, [bornes, typeFilter, statusFilter]);

  const applyFilters = (data) => {
    return data.filter((b) => {
      const matchType = typeFilter ? b.type === typeFilter : true;
      const matchStatus = statusFilter ? b.status === statusFilter : true;
      return matchType && matchStatus;
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Bornes", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Nom", "Statut", "Niveau (%)", "Humidité (%)", "Dernière MAJ"]],
      body: filteredBornes.map((b) => [
        b.nom,
        b.status || "-",
        b.niveau ?? "-",
        b.humidite ?? "-",
        new Date(b.last_data_received_at).toLocaleString(),
      ]),
    });
    doc.save("bornes.pdf");
  };

  const uniqueTypes = [...new Set(bornes.map((b) => b.type).filter(Boolean))];
  const uniqueStatuses = [...new Set(bornes.map((b) => b.status).filter(Boolean))];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-2 border-b border-gray-200 gap-2">
        <h3 className="text-lg font-semibold text-gray-700">Tableau des bornes</h3>
        <div className="flex gap-3 flex-wrap">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tous types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous statuts</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={generatePDF}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Niveau (%)</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Humidité (%)</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Dernière MAJ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBornes.map((borne) => (
              <tr key={borne.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{borne.nom}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    borne.status === "online"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}>
                    {borne.status || "Inconnu"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">{borne.niveau ?? "-"}</td>
                <td className="px-4 py-2 text-sm">{borne.humidite ?? "-"}</td>
                <td className="px-4 py-2 text-sm">{new Date(borne.last_data_received_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
