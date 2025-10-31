import React, { useState, useEffect } from "react";
import axios from "axios";
import type { RolFormPermission } from "../Api/Types/rolFormPermission";


const RolFormPermissionList: React.FC = () => {
  const [permissions, setPermissions] = useState<RolFormPermission[]>([]);
  const [editPermission, setEditPermission] = useState<RolFormPermission | null>(null);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos

  const fetchPermissions = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token no encontrado. El usuario no está autenticado.");
      setError("Usuario no autenticado. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    axios
      .get("/api/RoleFormPermission/getAll", {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Respuesta de la API:", res.data.data); // Inspeccionar los datos
        if (Array.isArray(res.data.data)) {
          const permissionsNormalized = res.data.data.map((permission: RolFormPermission) => ({
            ...permission,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setPermissions(permissionsNormalized);
        } else {
          setPermissions([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar permisos:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError("No autorizado. Por favor, verifica tus credenciales.");
        } else {
          setError("Error al cargar permisos.");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPermissions();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando permisos...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/RoleFormPermission/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPermissions(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar permiso:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/RoleFormPermission/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPermissions(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar permiso:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Permisos de Roles</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddPermissionOpen(true)}
        >
          Agregar Permiso
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
      <div
        className="overflow-x-auto overflow-y-auto scrollbar-hide"
        style={{
          maxHeight: "60vh", // Limitar la altura del scroll
          WebkitOverflowScrolling: "touch", // Suavizar el scroll en dispositivos móviles
        }}
      >
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-sky-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Rol</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Formulario</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Permiso</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                  No hay permisos para mostrar.
                </td>
              </tr>
            ) : (
              permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{permission.role}</td>
                  <td className="py-2 px-4 border-b">{permission.form}</td>
                  <td className="py-2 px-4 border-b">{permission.permission}</td>
                  <td className="py-2 px-4 border-b">
                    {permission.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditPermission(permission)}
                    >
                      Editar
                    </button>
                    {permission.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(permission.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(permission.id)}
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

      {editPermission && (
        <EditRolFormPermission
          permission={editPermission}
          onClose={() => setEditPermission(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPermissions();
          }}
        />
      )}
      {addPermissionOpen && (
        <AddRolFormPermission
          onClose={() => setAddPermissionOpen(false)}
          onCreated={() => {
            setLoading(true);
            fetchPermissions();
          }}
        />
      )}
    </div>
  );
};

interface EditRolFormPermissionProps {
  permission: RolFormPermission;
  onClose: () => void;
  onUpdated: () => void;
}

const EditRolFormPermission: React.FC<EditRolFormPermissionProps> = ({ permission, onClose, onUpdated }) => {
  const [roleId, setRoleId] = useState(permission.roleId);
  const [formId, setFormId] = useState(permission.formId);
  const [permissionId, setPermissionId] = useState(permission.permissionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/RoleFormPermission`,
        {
          id: permission.id,
          roleId,
          formId,
          permissionId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdated(); // Refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al actualizar el permiso. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Editar Permiso</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Rol</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={roleId || ""}
                onChange={(e) => setRoleId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un rol</option>
                {/* Aquí deberías mapear los roles disponibles */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Formulario</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formId || ""}
                onChange={(e) => setFormId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un formulario</option>
                {/* Aquí deberías mapear los formularios disponibles */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Permiso</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={permissionId || ""}
                onChange={(e) => setPermissionId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un permiso</option>
                {/* Aquí deberías mapear los permisos disponibles */}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddRolFormPermissionProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddRolFormPermission: React.FC<AddRolFormPermissionProps> = ({ onClose, onCreated }) => {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [forms, setForms] = useState<{ id: number; name: string }[]>([]);
  const [permissions, setPermissions] = useState<{ id: number; name: string }[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [permissionId, setPermissionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [rolesRes, formsRes, permissionsRes] = await Promise.all([
          axios.get("/api/Role/getAll", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/Form/getAll", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/Permission/getAll", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setRoles(rolesRes.data.data || []);
        setForms(formsRes.data.data || []);
        setPermissions(permissionsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Error al cargar datos para los dropdowns.");
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/RoleFormPermission`,
        {
          roleId,
          formId,
          permissionId,
          state: true, // Por defecto, el permiso se crea activo
          createdAt: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onCreated(); // Refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al crear el permiso. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Agregar Permiso</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Rol</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={roleId || ""}
                onChange={(e) => setRoleId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Formulario</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formId || ""}
                onChange={(e) => setFormId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un formulario</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Permiso</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={permissionId || ""}
                onChange={(e) => setPermissionId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un permiso</option>
                {permissions.map((permission) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolFormPermissionList;