// src/components/AgregarExperiencia/FollowUpEvaluation.tsx
import React from "react";
import type { Objective } from "../../Api/Types/experienceTypes";


interface FollowUpEvaluationProps {
  value: Objective;
  onChange: (val: Objective) => void;
}

const MAX_CHARACTERS = {
  followEvaluation: 150,
  resulsExperience: 200,
  sustainabilityExperience: 150,
  tranfer: 150,
};

const FollowUpEvaluation: React.FC<FollowUpEvaluationProps> = ({ value, onChange }) => {
  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="w-full border rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">SEGUIMIENTO Y EVALUACIÓN</h2>

      {/* Seguimiento y evaluación */}
      <div className="mb-6 relative">
        <label className="block font-medium">SEGUIMIENTO Y EVALUACIÓN</label>
        <p className="text-sm text-gray-600 mb-2">
          Describa la metodología y los mecanismos establecidos...
        </p>
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          value={value.followEvaluation || ""}
          onChange={(e) => onChange({ ...value, followEvaluation: e.target.value })}
          maxLength={MAX_CHARACTERS.followEvaluation} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.followEvaluation || "",
            MAX_CHARACTERS.followEvaluation
          )}`}
        >
          {value.followEvaluation?.length || 0}/{MAX_CHARACTERS.followEvaluation}
        </span>
      </div>

      {/* Resultados */}
      <div className="mb-6 relative">
        <label className="block font-medium">RESULTADOS</label>
        <p className="text-sm text-gray-600 mb-2">
          Especifique cuáles han sido los logros obtenidos...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={value.resulsExperience || ""}
          onChange={(e) => onChange({ ...value, resulsExperience: e.target.value })}
          maxLength={MAX_CHARACTERS.resulsExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.resulsExperience || "",
            MAX_CHARACTERS.resulsExperience
          )}`}
        >
          {value.resulsExperience?.length || 0}/{MAX_CHARACTERS.resulsExperience}
        </span>
      </div>

      {/* Sostenibilidad */}
      <div className="mb-6 relative">
        <label className="block font-medium">SOSTENIBILIDAD</label>
        <p className="text-sm text-gray-600 mb-2">
          Mencione las estrategias previstas para garantizar la continuidad...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={value.sustainabilityExperience || ""}
          onChange={(e) => onChange({ ...value, sustainabilityExperience: e.target.value })}
          maxLength={MAX_CHARACTERS.sustainabilityExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.sustainabilityExperience || "",
            MAX_CHARACTERS.sustainabilityExperience
          )}`}
        >
          {value.sustainabilityExperience?.length || 0}/{MAX_CHARACTERS.sustainabilityExperience}
        </span>
      </div>

      {/* Transferencia */}
      <div className="relative">
        <label className="block font-medium">TRANSFERENCIA</label>
        <p className="text-sm text-gray-600 mb-2">
          Especifique los procesos, metodologías, mecanismos...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={value.tranfer || ""}
          onChange={(e) => onChange({ ...value, tranfer: e.target.value })}
          maxLength={MAX_CHARACTERS.tranfer} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.tranfer || "",
            MAX_CHARACTERS.tranfer
          )}`}
        >
          {value.tranfer?.length || 0}/{MAX_CHARACTERS.tranfer}
        </span>
      </div>
    </div>
  );
};

export default FollowUpEvaluation;
