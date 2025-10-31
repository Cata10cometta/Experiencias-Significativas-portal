import React, { useState, useEffect } from "react";
import axios from "axios";
import { Person } from "../../Api/Types/Person"; // Asegúrate de importar el tipo Person
import { getEnum } from "../../Api/Services/Helper"; // Asegúrate de importar la función para obtener enums
import { DataSelectRequest } from "../../Api/Types/HelperTypes";


interface AddPersonFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onClose, onAdded }) => {
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [firstLastName, setFirstLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailInstitutional, setEmailInstitutional] = useState("");
  const [phone, setPhone] = useState("");
  const [codeDane, setCodeDane] = useState("");
  const [documentType, setDocumentType] = useState(0); // Tipo de documento
  const [documentTypes, setDocumentTypes] = useState<DataSelectRequest[]>([]); // Estado para los valores del enum
    const [codigoDaneOptions, setCodigoDaneOptions] = useState<DataSelectRequest[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const documentTypes = await getEnum("DocumentType");
        setDocumentTypes(documentTypes);
        console.log("DocumentTypes recibidos:", documentTypes);

        const codigoDaneOptions = await getEnum("CodeDane");
        setCodigoDaneOptions(codigoDaneOptions);
        console.log("CodeDane recibidos:", codigoDaneOptions);
      } catch (err) {
        console.error("Error al obtener valores de los enums:", err);
      }
    };

    fetchEnums();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "/api/Person",
        {
          identificationNumber,
          firstName,
          middleName,
          firstLastName,
          secondLastName,
          email,
          emailInstitutional,
          phone: parseInt(phone, 10),
          codeDane,
          documentType,
          state: true, // Por defecto, la persona se crea activa
          createdAt: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onAdded(); // Llamar al callback para refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al crear la persona. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Agregar Persona</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Tipo de Documento</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={documentType}
                onChange={(e) => setDocumentType(parseInt(e.target.value, 10))}
                required
              >
                <option value="">Seleccione...</option>
                {documentTypes.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.displayText}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Número de Identificación</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Primer Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Segundo Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Primer Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={firstLastName}
                onChange={(e) => setFirstLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Segundo Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={secondLastName}
                onChange={(e) => setSecondLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email Institucional</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                value={emailInstitutional}
                onChange={(e) => setEmailInstitutional(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Código Dane</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={codeDane}
                onChange={(e) => setCodeDane(e.target.value)} // Actualizar el estado con el valor seleccionado
              >
                <option value="">Seleccione...</option>
                {codigoDaneOptions.map((option) => (
                  <option key={option.displayText} value={option.displayText}>
                    {option.id} {/* Mostrar el texto del enum */}
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

interface EditPersonFormProps {
  person: Person;
  onClose: () => void;
  onUpdated: () => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({ person, onClose, onUpdated }) => {
  const [firstName, setFirstName] = useState(person.firstName);
  const [middleName, setMiddleName] = useState(person.middleName);
  const [firstLastName, setFirstLastName] = useState(person.firstLastName);
  const [secondLastName, setSecondLastName] = useState(person.secondLastName);
  const [email, setEmail] = useState(person.email);
  const [phone, setPhone] = useState(person.phone.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/Person`,
        {
          id: person.id,
          firstName,
          middleName,
          firstLastName,
          secondLastName,
          email,
          phone: parseInt(phone, 10),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdated(); // Refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al actualizar la persona. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Editar Persona</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Primer Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Segundo Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Primer Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={firstLastName}
                onChange={(e) => setFirstLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Segundo Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={secondLastName}
                onChange={(e) => setSecondLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
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

const PersonsList: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar personas activas/inactivas

  const fetchPersons = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/Person/getAll", {
        params: { OnlyActive: onlyActive },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const personsNormalized = res.data.data.map((person: Person) => ({
            ...person,
            state: onlyActive ? true : false, // Adjust state interpretation based on OnlyActive
          }));
          setPersons(personsNormalized);
        } else {
          setPersons([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar personas");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPersons();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando personas...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/Person/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPersons(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar persona:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/Person/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPersons(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar persona:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Personas</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddPersonOpen(true)}
        >
          Agregar Persona
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
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Tipo Documento</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Número Identificación</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Primer Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Segundo Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Primer Apellido</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Segundo Apellido</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Email Institucional</th> {/* Nuevo campo */}
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Teléfono</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Código Dane</th> {/* Nuevo campo */}
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {persons.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-6 px-4 text-center text-gray-500">
                  No hay personas para mostrar.
                </td>
              </tr>
            ) : (
              persons.map((person) => (
                <tr key={person.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{person.documentType}</td>
                  <td className="py-2 px-4 border-b">{person.identificationNumber}</td>
                  <td className="py-2 px-4 border-b">{person.firstName}</td>
                  <td className="py-2 px-4 border-b">{person.middleName || ""}</td>
                  <td className="py-2 px-4 border-b">{person.firstLastName}</td>
                  <td className="py-2 px-4 border-b">{person.secondLastName || ""}</td>
                  <td className="py-2 px-4 border-b">{person.email}</td>
                  <td className="py-2 px-4 border-b">{person.emailInstitutional || ""}</td>
                  <td className="py-2 px-4 border-b">{person.phone}</td>
                  <td className="py-2 px-4 border-b">{person.codeDane || ""}</td>
                  <td className="py-2 px-4 border-b">{person.state ? "Activo" : "Inactivo"}</td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditPerson(person)}
                    >
                      Editar
                    </button>
                    {person.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(person.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(person.id)}
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

      {editPerson && (
        <EditPersonForm
          person={editPerson}
          onClose={() => setEditPerson(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPersons();
          }}
        />
      )}
      {addPersonOpen && (
        <AddPersonForm
          onClose={() => setAddPersonOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchPersons();
          }}
        />
      )}
    </div>
  );
};

export default PersonsList;