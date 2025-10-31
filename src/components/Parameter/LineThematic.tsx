import React, { useEffect, useState } from "react";
import axios from "axios";
import type { LineThematic } from "../../Api/Types/lineThematic";


interface EditLineThematicFormProps {
  lineThematic: LineThematic;
  onClose: () => void;
  onUpdated: () => void;
}

const EditLineThematicForm: React.FC<EditLineThematicFormProps> = ({ lineThematic, onClose, onUpdated }) => {
  const [name, setName] = useState(lineThematic.name);
  const [code, setCode] = useState(lineThematic.code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/LineThematic`,
        {
          id: lineThematic.id,
          name,
          code,
          state: lineThematic.state ?? true,
          createdAt: lineThematic.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar línea temática");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Línea Temática</h3>
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

interface AddLineThematicFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddLineThematicForm: React.FC<AddLineThematicFormProps> = ({ onClose, onAdded }) => {
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
        `/api/LineThematic`,
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
      setError("Error al agregar línea temática");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Línea Temática</h3>
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

const LineThematicList: React.FC = () => {
  const [lineThematics, setLineThematics] = useState<LineThematic[]>([]);
  const [editLineThematic, setEditLineThematic] = useState<LineThematic | null>(null);
  const [addLineThematicOpen, setAddLineThematicOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos

  const fetchLineThematics = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/LineThematic/getAll`, {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const lineThematicsNormalized = res.data.data.map((lineThematic: LineThematic) => ({
            ...lineThematic,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setLineThematics(lineThematicsNormalized);
        } else {
          setLineThematics([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar líneas temáticas");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLineThematics();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando líneas temáticas...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/LineThematic/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLineThematics(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar línea temática:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/LineThematic/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLineThematics(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar línea temática:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Líneas Temáticas</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddLineThematicOpen(true)}
        >
          Agregar Línea Temática
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
            {lineThematics.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                  No hay líneas temáticas para mostrar.
                </td>
              </tr>
            ) : (
              lineThematics.map((lineThematic) => (
                <tr key={lineThematic.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{lineThematic.code}</td>
                  <td className="py-2 px-4 border-b">{lineThematic.name}</td>
                  <td className="py-2 px-4 border-b">
                    {lineThematic.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditLineThematic(lineThematic)}
                    >
                      Editar
                    </button>
                    {lineThematic.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(lineThematic.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(lineThematic.id)}
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

      {editLineThematic && (
        <EditLineThematicForm
          lineThematic={editLineThematic}
          onClose={() => setEditLineThematic(null)}
          onUpdated={() => {
            setLoading(true);
            fetchLineThematics();
          }}
        />
      )}
      {addLineThematicOpen && (
        <AddLineThematicForm
          onClose={() => setAddLineThematicOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchLineThematics();
          }}
        />
      )}
    </div>
  );
};

export default LineThematicList;