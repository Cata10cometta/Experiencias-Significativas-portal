import React, { useState } from "react";
import perfilImg from "../../public/images/perfil.png";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TopBar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalType, setResultModalType] = useState<'success' | 'error' | null>(null);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token"); // Opcional
    navigate("/login");
  };

  // Obtener el userId desde el token o contexto (ajusta según tu app)
  const userId = Number(localStorage.getItem("userId")); // <-- Cambia esto por el userId real

  // Obtener el primer nombre del usuario desde localStorage
  const userName = localStorage.getItem("userName") || "Usuario";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const resp = await axios.put( // Cambiar método a PUT
            "/api/Auth/UpdatePassword", // Confirmar que la URL es correcta
            {
                userId,
                currentPassword,
                newPassword,
                confirmPassword,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setResultModalType('success');
        setResultModalMessage(resp?.data?.message || "Contraseña actualizada correctamente");
        setShowResultModal(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordModal(false);
        setTimeout(() => setShowResultModal(false), 2500);
    } catch (err: any) {
        setResultModalType('error');
        setResultModalMessage(err?.response?.data?.message || err?.message || "Error al actualizar la contraseña");
        setShowResultModal(true);
        setTimeout(() => setShowResultModal(false), 2500);
    }
};

const validatePassword = (password: string) => {
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    hasUpperLower,
    hasNumber,
    hasMinLength,
    hasSpecialChar,
  };
};

const passwordValidation = validatePassword(newPassword);

  return (
      <div
        className="rounded flex justify-between items-center px-3 mt-10 py-2 bg-gray-200 relative w-[98%] left-[1%]"
      >
        {/* Barra de búsqueda */}
        <div className="flex items-center bg-white rounded px-2 py-1">
          <input
            type="text"
            placeholder="Buscar Experiencia"
            className="border-none outline-none py-1 pl-2 pr-32 text-sm bg-transparent"
          />
          <FaSearch className="text-cyan-700 cursor-pointer ml-2" />
        </div>

        {/* Info de usuario y botón sesión */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer relative"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <img
              src={perfilImg}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
              style={{ objectFit: "cover" }}
            />
            <span>{userName}</span>
            {openMenu ? <FaChevronUp /> : <FaChevronDown />}

      

            {/* Menú desplegable con fondo negro translúcido */}
            {openMenu && (
              <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg overflow-hidden w-44 z-[1000] flex flex-col">
                <button
                  className="py-1 hover:bg-gray-100 text-center"
                  onClick={() => {
                    setShowPasswordModal(true);
                    setOpenMenu(false);
                  }}
                >
                  Cambiar Contraseña
                </button>
                <button className="py-1 hover:bg-gray-100 text-center">Ayuda</button>
                <button
                  className="py-1 bg-red-600 text-white text-center flex items-center justify-center gap-2 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  Finalizar sesión
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          
        </div>

      {/* Modal personalizado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-xl text-center w-72">
            <h5 className="font-bold text-2xl mb-4">¿Estas seguro de cerrar sesión?</h5>
            <div className="flex ml-20 items-center mb-10">
              <BiLogOut className="text-6xl text-black" />
            </div>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleLogoutConfirm}
                className="bg-green-400 text-white rounded-10 px-8 py-2 font-bold hover:bg-green-500 text-lg"
              >
                Si
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white rounded-lg px-8 py-2 font-bold hover:bg-red-600 text-lg"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
  {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg relative">
      {/* Icono de candado */}
      <div className="flex flex-col items-center -mt-12 mb-4">
        <div className="bg-blue-100 rounded-full p-4 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zm6 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2z"
            />
          </svg>
        </div>
      </div>
      {/* Botón cerrar */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        onClick={() => setShowPasswordModal(false)}
        aria-label="Cerrar"
      >
        ×
      </button>
      <h2 className="font-bold text-2xl mb-1 text-left">Cambiar contraseña</h2>
      <p className="text-gray-500 mb-6 text-left">
        Ingresa tu contraseña actual y crea una nueva
      </p>
      <form className="flex flex-col gap-4" onSubmit={handlePasswordChange}>
        <div className="text-left">
          <label className="font-semibold mb-1 block">Contraseña actual</label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña actual"
            className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="text-left">
          <label className="font-semibold mb-1 block">Nueva contraseña</label>
          <input
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="text-left">
          <label className="font-semibold mb-1 block">Confirmar nueva contraseña</label>
          <input
            type="password"
            placeholder="Confirma tu nueva contraseña"
            className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        
        {/* Validaciones dinámicas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-400 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zm6 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2z"
            />
          </svg>
          <div>
            <span className="font-semibold text-gray-700">Seguridad:</span>
            <ul className="text-sm mt-1 list-disc list-inside">
              <li
                className={
                  passwordValidation.hasUpperLower
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Al menos una mayúscula y una minúscula
              </li>
              <li
                className={
                  passwordValidation.hasMinLength
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Mínimo 8 caracteres
              </li>
              <li
                className={
                  passwordValidation.hasNumber
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Al menos un número
              </li>
              <li
                className={
                  passwordValidation.hasSpecialChar
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Al menos un carácter especial (e.g., !@#$%^&*)
              </li>
            </ul>
          </div>
        </div>
        {(passwordError || passwordSuccess) && (
          <div className={
            passwordError
              ? "text-red-500 font-bold bg-red-100 rounded p-2"
              : "text-green-600 font-bold bg-green-100 rounded p-2"
          }>
            {passwordError || passwordSuccess}
          </div>
        )}
        <div className="flex justify-between mt-6">
          <div className="flex gap-2 w-full justify-center">
            <button
              type="button"
              className="bg-gray-100 text-gray-700 !rounded-xl px-8 py-3 font-bold hover:bg-gray-200 text-lg"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white !rounded-xl px-8 py-3 font-bold hover:bg-blue-600 text-lg"
            >
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Modal resultado cambio contraseña */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100]">
          <div className={`bg-white p-8 rounded-xl text-center w-96 shadow-lg ${resultModalType === 'success' ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}>
            <h5 className={`font-bold text-2xl mb-4 ${resultModalType === 'success' ? 'text-green-600' : 'text-red-600'}`}>{resultModalType === 'success' ? '¡Éxito!' : 'Error'}</h5>
            <div className="text-lg">{resultModalMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
