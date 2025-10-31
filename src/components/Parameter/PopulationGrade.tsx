import React, { useEffect, useState } from "react";
import axios from "axios";
import type { PopulationGrade } from "../../Api/Types/populationGrade";


interface EditPopulationGradeFormProps {
  populationGrade: PopulationGrade;
  onClose: () => void;
  onUpdated: () => void;
}

const EditPopulationGradeForm: React.FC<EditPopulationGradeFormProps> = ({ populationGrade, onClose, onUpdated }) => {
  const [name, setName] = useState(populationGrade.name);
  const [code, setCode] = useState(populationGrade.code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/PopulationGrade`,
        {
          id: populationGrade.id,
          name,
          code,
          state: populationGrade.state ?? true,
          createdAt: populationGrade.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar grado de población");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Grado de Población</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface AddPopulationGradeFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddPopulationGradeForm: React.FC<AddPopulationGradeFormProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/PopulationGrade`,
        {
          id: 0,
          name,
          code,
          state: true,
          createdAt: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onAdded();
      onClose();
    } catch {
      setError("Error al agregar grado de población");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Grado de Población</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            {loading ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
};

const PopulationGradeList: React.FC = () => {
  const [populationGrades, setPopulationGrades] = useState<PopulationGrade[]>([]);
  const [editPopulationGrade, setEditPopulationGrade] = useState<PopulationGrade | null>(null);
  const [addPopulationGradeOpen, setAddPopulationGradeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos

  const fetchPopulationGrades = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/PopulationGrade/getAll`, {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const populationGradesNormalized = res.data.data.map((populationGrade: PopulationGrade) => ({
            ...populationGrade,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setPopulationGrades(populationGradesNormalized);
        } else {
          setPopulationGrades([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar grados de población");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPopulationGrades();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando grados de población...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/PopulationGrade/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPopulationGrades(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar grado de población:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/PopulationGrade/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPopulationGrades(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar grado de población:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Grados de Población</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddPopulationGradeOpen(true)}
        >
          Agregar Grado de Población
        </button>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded font-semibold ${
              onlyActive ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
            onClick={() => setOnlyActive(true)} // Mostrar activos
          >
            Mostrar Activos
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              !onlyActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
            onClick={() => setOnlyActive(false)} // Mostrar inactivos
          >
            Mostrar Inactivos
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-sky-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Código</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {populationGrades.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                  No hay grados de población para mostrar.
                </td>
              </tr>
            ) : (
              populationGrades.map((populationGrade) => (
                <tr key={populationGrade.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{populationGrade.code}</td>
                  <td className="py-2 px-4 border-b">{populationGrade.name}</td>
                  <td className="py-2 px-4 border-b">
                    {populationGrade.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditPopulationGrade(populationGrade)}
                    >
                      Editar
                    </button>
                    {populationGrade.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(populationGrade.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(populationGrade.id)}
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editPopulationGrade && (
        <EditPopulationGradeForm
          populationGrade={editPopulationGrade}
          onClose={() => setEditPopulationGrade(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPopulationGrades();
          }}
        />
      )}
      {addPopulationGradeOpen && (
        <AddPopulationGradeForm
          onClose={() => setAddPopulationGradeOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchPopulationGrades();
          }}
        />
      )}
    </div>
  );
};

export default PopulationGradeList;