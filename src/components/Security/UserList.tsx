import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../Api/Types/user";
import { Person } from "../Api/Types/Person"; // Asegúrate de importar el tipo Person



interface EditUserFormProps {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onUpdated }) => {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/User`, {
        id: user.id,
        code: user.code,
        username,
        password,
        state: user.state ?? true,
        createdAt: user.createdAt ?? new Date().toISOString(),
        deletedAt: user.deletedAt ?? null,
        personId: user.personId ?? 0,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onUpdated();
      onClose();
    } catch (err) {
      setError("Error al actualizar usuario");
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Usuario</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={user.code} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
        <label className="block mb-2 font-semibold">Nombre de Usuario</label>
        <input value={username} onChange={e => setUsername(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
};


interface AddUserFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onAdded }) => {
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [personId, setPersonId] = useState<number | null>(null); // Estado para la persona seleccionada
  const [persons, setPersons] = useState<Person[]>([]); // Lista de personas disponibles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener la lista de personas desde la API
    const fetchPersons = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("/api/Person/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPersons(response.data.data || []);
      } catch (err) {
        console.error("Error al obtener personas:", err);
      }
    };
    fetchPersons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    const userData = {
      code,
      username,
      password,
      state: true,
      createdAt: new Date().toISOString(),
      deletedAt: null,
      personId, // Vincular con la persona seleccionada
    };

    console.log("Datos enviados al backend:", userData); // Verificar el cuerpo de la solicitud

    try {
      await axios.post("/api/User/register", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      console.error("Error al agregar usuario:", err);
      setError("Error al agregar usuario");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Usuario</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="Ingrese el código"
        />
        <label className="block mb-2 font-semibold">Nombre de Usuario</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="Ingrese el nombre de usuario"
        />
        <label className="block mb-2 font-semibold">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="Ingrese la contraseña"
        />
        <label className="block mb-2 font-semibold">Persona</label>
        <select
          value={personId || ""}
          onChange={(e) => setPersonId(Number(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="" disabled>Seleccione una persona</option>
          {persons.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName} ({person.firstName} {person.firstLastName})
            </option>
          ))}
        </select>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}


const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [addUser, setAddUser] = useState(false); // Estado para mostrar el formulario de agregar usuario
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar usuarios activos/inactivos

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/User/getAll", {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const usersNormalized = res.data.data.map((user: User) => ({
            ...user,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setUsers(usersNormalized);
        } else {
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar usuarios");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/User/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar usuario:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/User/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar usuario:", err);
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Usuarios</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddUser(true)}
        >
          Agregar Usuario
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
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Nombre de Usuario</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">No hay usuarios para mostrar.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.code} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{user.code}</td>
                  <td className="py-2 px-4 border-b">{user.username}</td>
                  <td className="py-2 px-4 border-b">
                    {user.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditUser(user)}
                    >
                      Editar
                    </button>
                    {user.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(user.id)}
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
      {editUser && (
        <EditUserForm
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => {
            setLoading(true);
            fetchUsers();
          }}
        />
      )}
      {addUser && (
        <AddUserForm
          onClose={() => setAddUser(false)}
          onAdded={() => {
            setLoading(true);
            fetchUsers();
          }}
        />
      )}
      {/* Modal de error al eliminar usuario */}
      {deleteError && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-2 sm:p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-4 text-red-700">Error</h3>
            <p className="mb-6 text-gray-700">{deleteError}</p>
            <button
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              onClick={() => setDeleteError(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
