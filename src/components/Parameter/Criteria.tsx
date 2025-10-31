import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Criteria } from "../../Api/Types/criteria";


interface EditCriteriaFormProps {
  criteria: Criteria;
  onClose: () => void;
  onUpdated: () => void;
}

const EditCriteriaForm: React.FC<EditCriteriaFormProps> = ({ criteria, onClose, onUpdated }) => {
  const [name, setName] = useState(criteria.name);
  const [code, setCode] = useState(criteria.code);
  const [descriptionContribution, setDescriptionContribution] = useState(criteria.descriptionContribution);
  const [descruotionType, setDescruotionType] = useState(criteria.descruotionType);
  const [evaluationValue, setEvaluationValue] = useState(criteria.evaluationValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/Criteria`,
        {
          id: criteria.id,
          name,
          code,
          descriptionContribution,
          descruotionType,
          evaluationValue,
          state: criteria.state ?? true,
          createdAt: criteria.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar criterio");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Criterio</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Contribución</label>
        <input
          value={descriptionContribution}
          onChange={(e) => setDescriptionContribution(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <label className="block mb-2 font-semibold">Tipo</label>
        <input
          value={descruotionType}
          onChange={(e) => setDescruotionType(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <label className="block mb-2 font-semibold">Valor de Evaluación</label>
        <input
          value={evaluationValue}
          onChange={(e) => setEvaluationValue(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
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

interface AddCriteriaFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddCriteriaForm: React.FC<AddCriteriaFormProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [descriptionContribution, setDescriptionContribution] = useState("");
  const [descruotionType, setDescruotionType] = useState("");
  const [evaluationValue, setEvaluationValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/Criteria`,
        {
          id: 0,
          name,
          code,
          descriptionContribution,
          descruotionType,
          evaluationValue,
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
      setError("Error al agregar criterio");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Criterio</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Contribución</label>
        <input
          value={descriptionContribution}
          onChange={(e) => setDescriptionContribution(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <label className="block mb-2 font-semibold">Tipo</label>
        <input
          value={descruotionType}
          onChange={(e) => setDescruotionType(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <label className="block mb-2 font-semibold">Valor de Evaluación</label>
        <input
          value={evaluationValue}
          onChange={(e) => setEvaluationValue(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
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

const CriteriaList: React.FC = () => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null);
  const [addCriteriaOpen, setAddCriteriaOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos

  const fetchCriteria = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/Criteria/getAll`, {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const criteriaNormalized = res.data.data.map((criterion: Criteria) => ({
            ...criterion,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setCriteria(criteriaNormalized);
        } else {
          setCriteria([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar criterios");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCriteria();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando criterios...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/Criteria/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCriteria(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar criterio:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/Criteria/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCriteria(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar criterio:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Criterios</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddCriteriaOpen(true)}
        >
          Agregar Criterio
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
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Contribución</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Tipo</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Valor de Evaluación</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {criteria.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 px-4 text-center text-gray-500">
                  No hay criterios para mostrar.
                </td>
              </tr>
            ) : (
              criteria.map((criterion) => (
                <tr key={criterion.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{criterion.code}</td>
                  <td className="py-2 px-4 border-b">{criterion.name}</td>
                  <td className="py-2 px-4 border-b">{criterion.descriptionContribution}</td>
                  <td className="py-2 px-4 border-b">{criterion.descruotionType}</td>
                  <td className="py-2 px-4 border-b">{criterion.evaluationValue}</td>
                  <td className="py-2 px-4 border-b">
                    {criterion.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditCriteria(criterion)}
                    >
                      Editar
                    </button>
                    {criterion.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(criterion.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(criterion.id)}
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

      {editCriteria && (
        <EditCriteriaForm
          criteria={editCriteria}
          onClose={() => setEditCriteria(null)}
          onUpdated={() => {
            setLoading(true);
            fetchCriteria();
          }}
        />
      )}
      {addCriteriaOpen && (
        <AddCriteriaForm
          onClose={() => setAddCriteriaOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchCriteria();
          }}
        />
      )}
    </div>
  );
};

export default CriteriaList;