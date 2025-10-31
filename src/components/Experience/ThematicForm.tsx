import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Experience } from "../../Api/Types/experienceTypes";

interface LineThematic {
  id: number;
  name: string;
}

interface ThematicFormProps {
  value: Experience;
  onChange: (value: Experience) => void;
}

const MAX_CHARACTERS = {
  coordinationTransversalProjects: 10,
  population: 50,
  coverage: 50,
  experiencesCovidPandemic: 50,
  pedagogicalStrategies: 50,
};

const ThematicForm: React.FC<ThematicFormProps> = ({ value, onChange }) => {
  const [lineasTematicas, setLineasTematicas] = useState<LineThematic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineasTematicas = async () => {
      try {
        const token = localStorage.getItem("token"); // Si necesitas autenticación
        const response = await axios.get("/api/LineThematic/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLineasTematicas(response.data.data || []);
      } catch (err) {
        setError("Error al cargar las líneas temáticas.");
      }
    };

    fetchLineasTematicas();
  }, []);

  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">TEMÁTICA Y DESARROLLO</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Temática de la experiencia significativa */}
        <div>
          <label className="block mb-2 font-medium">
            Temática de la experiencia significativa
          </label>
          <select
            className="border rounded p-2 w-full"
            value={value.thematicLineIds?.join(", ") || ""}
            onChange={(e) =>
              onChange({
                ...value,
                thematicLineIds: e.target.value.split(",").map(Number),
              })
            }
          >
            <option value="" disabled>
              Seleccione una temática
            </option>
            {lineasTematicas.map((linea) => (
              <option key={linea.id} value={linea.id}>
                {linea.name}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Estrategias pedagógicas */}
        <div className="relative">
          <label className="block mb-2 font-medium">Estrategias pedagógicas</label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Estrategias pedagógicas"
            value={value.pedagogicalStrategies || ""}
            maxLength={MAX_CHARACTERS.pedagogicalStrategies} // Restricción de caracteres
            onChange={(e) =>
              onChange({ ...value, pedagogicalStrategies: e.target.value })
            }
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              value.pedagogicalStrategies || "",
              MAX_CHARACTERS.pedagogicalStrategies
            )}`}
          >
            {value.pedagogicalStrategies?.length || 0}/{MAX_CHARACTERS.pedagogicalStrategies}
          </span>
        </div>

        {/* Articulación y proyectos transversales */}
        <div className="relative">
          <label className="block mb-2 font-medium">
            Articulación y proyectos transversales
          </label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Articulación y proyectos transversales"
            value={value.coordinationTransversalProjects || ""}
            maxLength={MAX_CHARACTERS.coordinationTransversalProjects} // Restricción de caracteres
            onChange={(e) =>
              onChange({ ...value, coordinationTransversalProjects: e.target.value })
            }
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              value.coordinationTransversalProjects || "",
              MAX_CHARACTERS.coordinationTransversalProjects
            )}`}
          >
            {value.coordinationTransversalProjects?.length || 0}/{MAX_CHARACTERS.coordinationTransversalProjects}
          </span>
        </div>

        {/* Cobertura */}
        <div className="relative">
          <label className="block mb-2 font-medium">Cobertura</label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Cobertura"
            value={value.coverage || ""}
            maxLength={MAX_CHARACTERS.coverage} // Restricción de caracteres
            onChange={(e) => onChange({ ...value, coverage: e.target.value })}
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              value.coverage || "",
              MAX_CHARACTERS.coverage
            )}`}
          >
            {value.coverage?.length || 0}/{MAX_CHARACTERS.coverage}
          </span>
        </div>

        {/* Poblaciones */}
        <div className="relative">
          <label className="block mb-2 font-medium">Poblaciones</label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Poblaciones"
            value={value.population || ""}
            maxLength={MAX_CHARACTERS.population} // Restricción de caracteres
            onChange={(e) => onChange({ ...value, population: e.target.value })}
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              value.population || "",
              MAX_CHARACTERS.population
            )}`}
          >
            {value.population?.length || 0}/{MAX_CHARACTERS.population}
          </span>
        </div>

        {/* Experiencias de Pandemia Covid 19 */}
        <div className="relative">
          <label className="block mb-2 font-medium">
            Experiencias de Pandemia Covid 19
          </label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Experiencias de Pandemia Covid 19"
            value={value.experiencesCovidPandemic || ""}
            maxLength={MAX_CHARACTERS.experiencesCovidPandemic} // Restricción de caracteres
            onChange={(e) =>
              onChange({ ...value, experiencesCovidPandemic: e.target.value })
            }
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              value.experiencesCovidPandemic || "",
              MAX_CHARACTERS.experiencesCovidPandemic
            )}`}
          >
            {value.experiencesCovidPandemic?.length || 0}/{MAX_CHARACTERS.experiencesCovidPandemic}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThematicForm;
