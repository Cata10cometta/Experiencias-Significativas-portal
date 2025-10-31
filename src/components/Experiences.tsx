import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import ExperienceModal from "./ExperienceModal";
import Evaluation from "./Evaluation";
import { getSelectedCards } from "./Tracking"; // Importar la función
import configApi from "../Api/Config/Config";
import type { Experience } from "../Api/Types/experienceTypes";
import type { FollowUp } from "../Api/Types/FollowUp";

interface ExperiencesProps {
  onAgregar: () => void;
}

const Experiences = ({ onAgregar }: ExperiencesProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showEvaluationFromIcon, setShowEvaluationFromIcon] = useState(false); // Estado para mostrar el modal de Evaluation desde el icono
  const [experienceList, setExperienceList] = useState<Experience[]>([]); // Lista de experiencias
  const [trackingData, setTrackingData] = useState<FollowUp | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const role = localStorage.getItem("role");

  const nuevas = [1];
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);

  const handleVisitarClick = (id: number) => {
    setSelectedExperienceId(id);
    setShowModal(true);
  };

  const handleIconClick = (id: number) => {
    setSelectedExperienceId(id);
    setShowEvaluationFromIcon(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedExperienceId(null);
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
    setShowEvaluationFromIcon(false);
  };

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/Experience/List`;
    const token = localStorage.getItem("token");

    const fetchExperiencias = async () => {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Error al obtener experiencias");

      let data = await res.json();
      setExperienceList(data);
    };

    fetchExperiencias();
  }, []);

  useEffect(() => {
    const fetchTrackingSummary = async () => {
      try {
        const body = {
          pageSize: 0,
          pageNumber: 0,
          filter: "",
          columnFilter: "",
          columnOrder: "",
          directionOrder: "",
          foreignKey: 0,
          nameForeignKey: "",
          aplyPagination: true,
        };
        const response = await configApi.post("/HistoryExperience/tracking-summary", body);
        setTrackingData(response.data);
      } catch (err) {
        setError("Error al obtener datos");
      }
    };
    fetchTrackingSummary();
  }, []);

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!trackingData) return <div className="text-center py-10 text-gray-500">Cargando...</div>;

  // Seleccionar las tarjetas específicas para el profesor
  const professorCards = [
    {
      title: "Número de experiencias con plan de mejoramiento",
      value: trackingData?.totalExperiencesWithComments ?? "Dato no disponible",
      icon: (
        <div className="bg-orange-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Número de experiencias registradas en la vigencia",
      value: trackingData?.totalExperiencesRegistradas ?? "Dato no disponible",
      icon: (
        <div className="bg-blue-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Participación de eventos SEM",
      value: trackingData?.totalExperiencesTestsKnow ?? "Dato no disponible",
      icon: (
        <div className="bg-green-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z"
            />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Mostrar tarjetas solo para el rol de profesor */}
      {role && role.toLowerCase() === "profesor" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {professorCards.map((card, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4 flex items-center space-x-4 w-full h-40">
              {card.icon}
              <div className="flex flex-col">
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mantener el resto del código existente */}
      <div className="font-bold text-[#00aaff] text-[28.242px] ">
        <p>Actualizar Experiencia</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {experienceList ? experienceList.map((exp) => (
          <div
            key={exp.id}
            className="relative border rounded-xl p-10 flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition duration-200 cursor-pointer"
          >
            {/* Icono en la esquina superior derecha */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-500"
              aria-label="Icono"
              onClick={() => handleIconClick(exp.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </button>
              {/* Resto del contenido de la tarjeta */}
              <img
                src="/images/Experiencias.png"
                alt="icono"
                className="w-40 h-17 mb-4"
              />
              <button className="bg-gray-100 rounded px-4 py-2 mt-2 font-semibold" onClick={() => handleVisitarClick(exp.id)}>
                Visitar Experiencia
              </button>
            </div>
        )) : (
          <p>Cargando experiencias...</p>
        )}
      </div>
      {/* Modal para mostrar la experiencia seleccionada */}
      {showModal && (
        <ExperienceModal
          show={showModal}
          onClose={handleClose}
          experienceId={selectedExperienceId ?? undefined}
          mode="edit" // Solo actualizar
        />
      )}

      {/* Modal de Evaluation desde el icono */}
      {showEvaluationFromIcon && (
        <div className="fixed inset-0 flex justify-center items-center z-[1100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-2 md:mx-0 p-0 relative flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseEvaluation}
              className="absolute top-4 right-4 text-2xl text-[#00aaff] hover:text-sky-800 focus:outline-none"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <Evaluation experienceId={selectedExperienceId ?? null} experiences={experienceList} />
          </div>
        </div>
      )}

      <div className="font-bold text-[#00aaff] text-[28.242px] w-full">
        <p>Registro de Nuevas Experiencias</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nuevas.map((n) => (
          <div
            key={n}
            onClick={onAgregar}
            className="border-2 border-dashed border-sky-200 bg-sky-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-100 transition"
          >
            <div className="bg-gray-100 rounded-xl p-3 mb-2">
              <span className="text-sky-500 text-2xl font-bold">+</span>
            </div>
            <p className="text-sm text-gray-600">Agregar Nueva Experiencia</p>
          </div>
        ))}
      </div>

      {/* Modal de Evaluación */}
      {showEvaluation && (
        <div className="fixed inset-0 flex justify-center items-center z-[1100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-2 md:mx-0 p-0 relative flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseEvaluation}
              className="absolute top-4 right-4 text-2xl text-[#00aaff] hover:text-sky-800 focus:outline-none"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <Evaluation />
          </div>
        </div>
      )}
    </div>
  );
};

export default Experiences;