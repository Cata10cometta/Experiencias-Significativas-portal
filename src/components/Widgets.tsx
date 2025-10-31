// src/components/Widgets.tsx
import React, { useState } from "react";

import ExperienceModal from "./ExperienceModal";

const Widgets: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedEje === null) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    fetch("/api/ExperienceLineThematic/getAll", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setExperiencias(data.data.filter((item: any) => item.lineThematicId === selectedEje));
        } else {
          setExperiencias([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar experiencias");
        setLoading(false);
      });
  }, [selectedEje]);
  const ejes = [
    { id: 1, label: "Educación Ambiental", img: "/images/EducacionAmbiental.png", imgClass: "w-15" },
    { id: 2, label: "Ciencia y Tecnología", img: "/images/Ciencia.png", imgClass: "w-20" },
    { id: 3, label: "Interculturalidad Bilingüismo", img: "/images/books.png", imgClass: "w-15" },
    { id: 4, label: "Arte, Cultura y Patrimonio", img: "/images/Arte.png", imgClass: "w-20" },
    { id: 5, label: "Habilidades Comunicativas", img: "/images/Habilidades.png", imgClass: "w-15" },
    { id: 6, label: "Acádemica Curricular", img: "/images/Acádemica.png", imgClass: "w-15" },
    { id: 7, label: "Inclusión Diversidad", img: "/images/inclusion.png", imgClass: "w-15" },
    { id: 8, label: "Convivencia Escolar (Ciencias Sociales y Políticas)", img: "/images/convivencia.png", imgClass: "w-15" },
    { id: 9, label: "Danza, Deporte y Recreación", img: "/images/deporte.png", imgClass: "w-20" },
  ];
  return (
  <div>
      <div className="font-bold text-[#00aaff] text-[28.242px] w-full">
        <p>Ejes temáticos</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {ejes.map(eje => (
          <button
            key={eje.id}
            className={`bg-white p-6 rounded-lg shadow-md w-70 h-35 text-center border-2 ${selectedEje === eje.id ? 'border-[#00aaff]' : 'border-transparent'}`}
            onClick={() => setSelectedEje(eje.id)}
          >
            <h6 className="text-lg font-semibold text-gray-800">
              <img src={eje.img} alt="" className={`mx-auto mb-2 ${eje.imgClass}`} />
              {eje.label}
            </h6>
          </button>
        ))}
      </div>
      <div className="mt-10 font-bold text-[#00aaff] text-[28.359px] w-full">
        <p>Experiencias</p>
      </div>
      {selectedEje && (
        <div className="mt-4">
          {loading ? (
            <div>Cargando experiencias...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : experiencias.length === 0 ? (
            <div className="text-gray-500">No hay experiencias para este eje temático.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {experiencias.map(exp => (
                <div
                  key={exp.id}
                  className="relative border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition duration-200 cursor-pointer bg-white w-70 h-56"
                >
                  <img
                    src="/images/Experiencias.png"
                    alt="icono"
                    className="w-40 h-16 mb-3"
                  />
                  <div className="mb-2 font-semibold text-sky-700 text-base"></div>
                  <button
                    className="bg-gray-100 rounded px-4 py-2 mt-2 text-sm font-semibold"
                    onClick={() => {
                      setSelectedExperienceId(exp.experienceId);
                      setModalOpen(true);
                    }}
                  >
                    Visitar Experiencia
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Modal de experiencia */}
      {modalOpen && selectedExperienceId && (
        <ExperienceModal
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          experienceId={selectedExperienceId}
          mode="view" // Solo visualizar
        />
      )}
    </div>
  );
};

0+63
export default Widgets;
