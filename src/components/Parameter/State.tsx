import React, { useEffect, useState } from "react";
import axios from "axios";
import type { State } from "../../Api/Types/state";


interface EditStateFormProps {
  stateItem: State;
  onClose: () => void;
  onUpdated: () => void;
}

const EditStateForm: React.FC<EditStateFormProps> = ({ stateItem, onClose, onUpdated }) => {
  const [name, setName] = useState(stateItem.name);
  const [code, setCode] = useState(stateItem.code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/State`,
        {
          id: stateItem.id,
          name,
          code,
          state: stateItem.state ?? true,
          createdAt: stateItem.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar estado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Estado</h3>
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

interface AddStateFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddStateForm: React.FC<AddStateFormProps> = ({ onClose, onAdded }) => {
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
        `/api/State`,
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
      setError("Error al agregar estado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Estado</h3>
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

const StateList: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [editState, setEditState] = useState<State | null>(null);
  const [addStateOpen, setAddStateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos

  const fetchStates = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/State/getAll`, {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const statesNormalized = res.data.data.map((stateItem: State) => ({
            ...stateItem,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setStates(statesNormalized);
        } else {
          setStates([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar estados");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStates();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando estados...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/State/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStates(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar estado:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/State/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStates(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar estado:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Estados</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddStateOpen(true)}
        >
          Agregar Estado
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
            {states.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                  No hay estados para mostrar.
                </td>
              </tr>
            ) : (
              states.map((stateItem) => (
                <tr key={stateItem.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{stateItem.code}</td>
                  <td className="py-2 px-4 border-b">{stateItem.name}</td>
                  <td className="py-2 px-4 border-b">
                    {stateItem.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditState(stateItem)}
                    >
                      Editar
                    </button>
                    {stateItem.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(stateItem.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(stateItem.id)}
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

      {editState && (
        <EditStateForm
          stateItem={editState}
          onClose={() => setEditState(null)}
          onUpdated={() => {
            setLoading(true);
            fetchStates();
          }}
        />
      )}
      {addStateOpen && (
        <AddStateForm
          onClose={() => setAddStateOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchStates();
          }}
        />
      )}
    </div>
  );
};

export default StateList;