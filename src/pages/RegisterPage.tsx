// src/pages/RegisterPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerPerson, registerUser } from "../Api/Services/Register";
import { getEnum } from "../Api/Services/Helper";
import { DataSelectRequest } from "../Api/Types/HelperTypes";



const RegisterPage: React.FC = () => {
  // ...existing code...
  const [codigoDaneFocus, setCodigoDaneFocus] = useState(false);
  const [emailInstitucionalFocus, setEmailInstitucionalFocus] = useState(false);
  const [PrimerNombre, setNombre] = useState("");
  const [SegundoNombre, setSegundoNombre] = useState("");
  const [PrimerApellido, setPrimerApellido] = useState("");
  const [SegundoApellido, setSegundoApellido] = useState("");
  const [TipoDocumento, setTipoDocumento] = useState("");
  const [NumeroDocumento, setNumeroDocumento] = useState("");
  const [CodigoDane, setCodigoDane] = useState("");
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [emailInstitucional, setEmailInstitucional] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState<string>("");
  const [password, setPassword] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DataSelectRequest[]>([]);
  const [codigoDaneOptions, setCodigoDaneOptions] = useState<DataSelectRequest[]>([]);
  const [emailInstitucionalOptions, setEmailInstitucionalOptions] = useState<DataSelectRequest[]>([]);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchEnums = async () => {
      const documentTypes = await getEnum("DocumentType");
      setDocumentTypes(documentTypes);
      console.log("DocumentTypes recibidos:", documentTypes);

      const emailInstitucionalOptions = await getEnum("EmailInstitucional");
      setEmailInstitucionalOptions(emailInstitucionalOptions);
      console.log("EmailInstitutional recibidos:", emailInstitucionalOptions);

      const codigoDaneOptions = await getEnum("CodeDane");
      setCodigoDaneOptions(codigoDaneOptions);
      console.log("CodeDane recibidos:", codigoDaneOptions);
    };

    fetchEnums();
  }, []);





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const personPayload = {
      DocumentType: String(TipoDocumento),
      IdentificationNumber: NumeroDocumento,
      FirstName: PrimerNombre,
      MiddleName: SegundoNombre,
      FirstLastName: PrimerApellido,
      SecondLastName: SegundoApellido,
      FullName: `${PrimerNombre} ${SegundoNombre} ${PrimerApellido} ${SegundoApellido}`.trim(),
      CodeDane: CodigoDane,
      EmailInstitutional: emailInstitucional,
      Email: email,
      Phone: telefono ? Number(telefono) : 0
    };


    try {
      // Paso 1: Registrar persona
      const response = await registerPerson(personPayload);
      console.log("Respuesta de /Person/create:", response);

      // Ajustar condición según la respuesta real del backend
      let personId = null;
      if (response && (response.id || response.Id)) {
        personId = response.id || response.Id;
      } else if (response.data && (response.data.id || response.data.Id)) {
        personId = response.data.id || response.data.Id;
      }

      if (personId) {
        // Paso 2: Registrar usuario (solo campos requeridos por el backend)
        const userPayload = {
          Code: "USR-" + Date.now(),
          Username: NombreUsuario,
          Password: password,
          PersonId: personId,
          Person: ""
        };
        console.log("Payload enviado a /User/register:", userPayload);
        try {
          const userResponse = await registerUser(userPayload);
          console.log("Respuesta de /User/register:", userResponse);
          // Considera exitoso si userResponse tiene un id, code o username
          if (userResponse && (userResponse.id || userResponse.Id || userResponse.username || userResponse.Username)) {
            // Guardar solo el primer nombre en localStorage para mostrarlo en el TopBar
            localStorage.setItem("userName", PrimerNombre);
            // Guardar los datos de la persona en localStorage para auto-llenar otros formularios
            localStorage.setItem("person", JSON.stringify({
              FirstName: PrimerNombre,
              SecondName: SegundoNombre,
              FirstLastName: PrimerApellido,
              SecondLastName: SegundoApellido,
              IdentificationNumber: NumeroDocumento,
              Email: email,
              EmailInstitutional: emailInstitucional,
              Phone: telefono,
              CodeDane: CodigoDane
            }));
            Swal.fire({
              title: "Registro Exitoso",
              icon: "success",
              text: "Su cuenta ha sido creada correctamente",
              confirmButtonText: "Iniciar sesión",
            }).then(() => {
              navigate("/login");
            });
          } else {
            Swal.fire({
              title: "Error",
              icon: "error",
              text: userResponse?.message || "No se pudo registrar el usuario",
            });
          }
        } catch (userErr: any) {
          console.error("Error en /User/register:", userErr);
          Swal.fire({
            title: "Error",
            icon: "error",
            text: userErr.response?.data?.message || userErr.message || "Error desconocido al registrar usuario",
          });
        }
      } else {
        Swal.fire({
          title: "Error",
          icon: "error",
          text: "No se pudo registrar la persona",
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: err.response?.data?.message || err.message || "Error desconocido",
      });
    }
  };

  return (

    <div>
      <img src="/images/Cohete.png" alt="Descripción de la imagen" className="w-600"
        style={{
          top: "-20%",
          left: "-12%",
          height: "200%",
          position: "absolute",
          rotate: "10deg",

        }} />

      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(50deg, #009CFF 20%, #FFFFFF 80%)",
        }}
      >

        {/* Sección derecha con formulario */}
        <div className="relative z-20 flex items-center justify-center w-167 h-full ">
          <div className="bg-white/70 p-6 md:p-10 rounded-lg shadow-md w-full max-w-3xl">
            <h2 className="text-5xl font-bold text-center mb-6">Registro</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">


              {/* Campos individuales */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Primer Nombre:</label>
                <input
                  type="text"
                  value={PrimerNombre}
                  onChange={(e) => {
                    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                    if (regex.test(e.target.value)) {
                      setNombre(e.target.value);
                    }
                  }}
                  required
                  className="w-70 border border-white-300 rounded-md px-4 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Segundo Nombre:</label>
                <input
                  type="text"
                  value={SegundoNombre}
                  onChange={(e) => {
                    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                    if (regex.test(e.target.value)) {
                      setSegundoNombre(e.target.value);
                    }
                  }}
                  className="w-70 border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primer Apellido:</label>
                <input
                  type="text"
                  value={PrimerApellido}
                  onChange={(e) => {
                    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                    if (regex.test(e.target.value)) {
                      setPrimerApellido(e.target.value);
                    }
                  }}
                  required
                  className="w-70 border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Segundo Apellido:</label>
                <input
                  type="text"
                  value={SegundoApellido}
                  onChange={(e) => {
                    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                    if (regex.test(e.target.value)) {
                      setSegundoApellido(e.target.value);
                    }
                  }}

                  className="w-70 border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Documento:</label>
                <select
                  value={TipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  required
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                <label className="block text-sm font-medium text-gray-700">Número de Documento:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={NumeroDocumento}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 10) setNumeroDocumento(val); // límite 10
                  }}
                  required
                  minLength={8}
                  maxLength={10}
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
                <p
                  className={`text-xs mt-1 ${NumeroDocumento.length < 8 || NumeroDocumento.length > 10
                      ? "text-red-500"
                      : "text-green-600"
                    }`}
                >
                  {NumeroDocumento.length} / 8-10 caracteres
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Código DANE:</label>
                <input
                  type="text"
                  value={CodigoDane}
                  onChange={e => setCodigoDane(e.target.value)}
                  onFocus={() => setCodigoDaneFocus(true)}
                  onBlur={() => setTimeout(() => setCodigoDaneFocus(false), 100)}
                  required
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  placeholder="Seleccione o escriba..."
                  autoComplete="off"
                />
                {codigoDaneFocus && (
                  <ul className="absolute left-0 z-10 bg-white border border-gray-300 rounded-md w-70 mt-1 max-h-40 overflow-y-auto shadow-lg" style={{ minWidth: '100%' }}>
                    {(CodigoDane
                      ? codigoDaneOptions.filter(opt => String(opt.id).toLowerCase().includes(CodigoDane.toLowerCase()))
                      : codigoDaneOptions
                    ).map(opt => (
                      <li
                        key={opt.id}
                        className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                        onMouseDown={() => { setCodigoDane(String(opt.id)); setCodigoDaneFocus(false); }}
                      >
                        {opt.id}
                      </li>
                    ))}
                    {(CodigoDane && codigoDaneOptions.filter(opt => String(opt.id).toLowerCase().includes(CodigoDane.toLowerCase())).length === 0) && (
                      <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Usuario:</label>
                <input
                  type="text"
                  value={NombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  required
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Correo de la Institucion:</label>
                <input
                  type="text"
                  value={emailInstitucional}
                  onChange={e => setEmailInstitucional(e.target.value)}
                  onFocus={() => setEmailInstitucionalFocus(true)}
                  onBlur={() => setTimeout(() => setEmailInstitucionalFocus(false), 100)}
                  required
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  placeholder="Seleccione o escriba..."
                  autoComplete="off"
                />
                {emailInstitucionalFocus && (
                  <ul className="absolute left-0 z-10 bg-white border border-gray-300 rounded-md w-70 mt-1 max-h-40 overflow-y-auto shadow-lg" style={{ minWidth: '100%' }}>
                    {(emailInstitucional
                      ? emailInstitucionalOptions.filter(opt => opt.displayText.toLowerCase().includes(emailInstitucional.toLowerCase()))
                      : emailInstitucionalOptions
                    ).map(opt => (
                      <li
                        key={opt.id}
                        className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                        onMouseDown={() => { setEmailInstitucional(opt.displayText); setEmailInstitucionalFocus(false); }}
                      >
                        {opt.displayText}
                      </li>
                    ))}
                    {(emailInstitucional && emailInstitucionalOptions.filter(opt => opt.displayText.toLowerCase().includes(emailInstitucional.toLowerCase())).length === 0) && (
                      <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Personal:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={telefono}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 10) setTelefono(val); // límite 10
                  }}
                  required
                  maxLength={10}
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
                <p
                  className={`text-xs mt-1 ${telefono.length !== 10 ? "text-red-500" : "text-green-600"
                    }`}
                >
                  {telefono.length} / 10 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-70 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>



              {/* Botón */}
              <div className="md:col-span-2 flex justify-center">
                <button
                  type="submit"
                  className="w-120 bg-[#00aaff] text-white py-2 px-4 !rounded-xl hover:bg-[#00aaff] focus:ring-2 focus:ring-[#00aaff]"
                >
                  Registrarse
                </button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              <a href="/login" className="text-indigo-600 hover:text-indigo-500">
                ¿Quieres iniciar sesión?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default RegisterPage;


