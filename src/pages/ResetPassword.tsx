import React, { useState } from "react";
import Cohete from "../../public/images/Cohete.png"
import flecha from "../../public/images/flecha.png";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ResetPassword: React.FC = () => {
  const [step, setStep] = useState(1); 
  const [password, setPassword] = useState(""); 
  const [code, setCode] = useState(Array(6).fill("")); 
  const [email, setEmail] = useState("");

  // Validaciones de la contraseña
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);


  // Volver al paso 1 limpiando 
  const goBackToStep1 = () => {
    setPassword("");
    setCode(Array(5).fill(""));
    setStep(1);
  };

  // Volver al paso 2 desde step 3
  const goBackToStep2 = () => {
    setPassword("");
    setCode(Array(5).fill(""));
    setStep(2);
  };

  // Manejo de los cuadritos del código
  const handleCodeChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Enfocar el siguiente cuadro si existe
    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    }
  };

  const sendForgotPasswordEmail = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/User/forgot-password`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Error al enviar el correo");

      const data = await response.text();
      console.log("Respuesta del servidor:", data);

      Swal.fire({
        title: "Éxito",
        text: data,
        icon: "success",
        confirmButtonText: "Continuar",
      }).then(() => setStep(2)); // Ir al paso 2
    } catch (err) {
      console.error("Error al enviar el correo:", err);

      Swal.fire({
        title: "Error",
        text: "No se pudo enviar el correo. Verifique el correo ingresado.",
        icon: "error",
      });
    }
  };

  const navigate = useNavigate(); // Hook para redirigir

  const resetPassword = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/User/reset-password`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: code.join(""), // Convertir el array de código en un string
          newPassword: password,
        }),
      });

      if (!response.ok) throw new Error("Error al cambiar la contraseña");

      const data = await response.text();
      console.log("Respuesta del servidor:", data);

      Swal.fire({
        title: "Éxito",
        text: "Contraseña cambiada exitosamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      }).then(() => navigate("/login")); // Redirigir al login
    } catch (err) {
      console.error("Error al cambiar la contraseña:", err);

      Swal.fire({
        title: "Error",
        text: "No se pudo cambiar la contraseña. Verifique los datos ingresados.",
        icon: "error",
      });
    }
  };

  const resendCode = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/User/forgot-password`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Error al reenviar el código");

      const data = await response.text();
      console.log("Código reenviado:", data);

      Swal.fire({
        title: "Éxito",
        text: "Código reenviado exitosamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      });
    } catch (err) {
      console.error("Error al reenviar el código:", err);

      Swal.fire({
        title: "Error",
        text: "No se pudo reenviar el código. Verifique el correo ingresado.",
        icon: "error",
      });
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(50deg, #009CFF 20%, #FFFFFF 80%)",
      }}
    >
      {/* Imagen de fondo */}
      <img
        src={Cohete}
        alt="Cohete"
        style={{
          top: "-1%",
          left: "-5%",
          width: "110%",
          height: "160%",
          position: "absolute",
        }}
      />

      {/* Cuadro principal */}
      <div className="w-[520px] min-h-[530px] p-8 relative rounded-xl overflow-hidden shadow-lg z-10">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-lg z-0" />
        <div className="relative z-10 p-8">
          {/* Flecha */}
          <div className="flex justify-center mb-6">
            {step === 1 ? (
              // Si estamos en el paso 1 -> lleva a /login
              <Link to="/login">
                <img
                  src={flecha}
                  alt="Volver"
                  className="cursor-pointer hover:scale-110 transition"
                  style={{
                    width: "60px",
                    transform: "translateX(-290%)",
                    marginTop: "-40px",
                  }}
                />
              </Link>
            ) : step === 2 ? (
              // Si estamos en el paso 2 -> vuelve al paso 1
              <img
                src={flecha}
                alt="Volver"
                onClick={goBackToStep1}
                className="cursor-pointer hover:scale-110 transition"
                style={{
                  width: "60px",
                  transform: "translateX(-290%)",
                  marginTop: "-40px",
                }}
              />
            ) : (
              // Si estamos en el paso 3 -> vuelve al paso 2
              <img
                src={flecha}
                alt="Volver"
                onClick={goBackToStep2}
                className="cursor-pointer hover:scale-110 transition"
                style={{
                  width: "60px",
                  transform: "translateX(-290%)",
                  marginTop: "-40px",
                }}
              />
            )}
          </div>

          {/* Título dinámico */}
          <h2 className="text-3xl font-bold text-center mb-6">
            {step === 1
              ? "Recuperar Contraseña"
              : step === 2
              ? "Crea una nueva contraseña"
              : step === 3
              ? "Solicitar nuevo código"
              : ""}
          </h2>

          {/* Pasos */}
          {step !== 3 && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full font-bold text-2xl ${
                  step === 1 ? " bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <div className="w-16 border-t border-gray-400"></div>
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full font-bold text-2xl ${
                  step === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
            </div>
          )}

          {/* Paso 1 - Ingresar correo */}
          {step === 1 && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Ingresa el correo registrado para enviarte un código de
                verificación. 
              </p>

              <div className="text-left mb-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email} // Conectar el estado `email`
                  onChange={(e) => setEmail(e.target.value)} // Actualizar el estado `email`
                  placeholder="correo@ejemplo.com"
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                onClick={sendForgotPasswordEmail}
                className="w-full bg-[#009CFF] text-white py-2 rounded-md hover:bg-blue-500 transition"
              >
                Enviar código
              </button>
            </>
          )}

          {/* Paso 2 - Código + Nueva contraseña */}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Ingresa el código que te enviamos a tu correo y crea tu nueva
                contraseña.
              </p>

              {/* Cuadros del código */}
              <div className="flex justify-center gap-3 mb-6">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-input-${i}`} // Agregar un id único para cada cuadro
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(e.target.value, i)}
                    className="w-12 h-12 border rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ))}
              </div>

              <div
                onClick={() => setStep(3)}
                className="text-right -mb-2"
              >
                <button className="text-sm text-blue-500 hover:underline">
                  Reenviar Código
                </button>
              </div>

              {/* Contraseña */}
              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Validaciones */}
              <ul className="text-sm mb-4 list-disc list-inside">
                <li
                  className={hasUpperLower ? "text-green-600" : "text-red-500"}
                >
                  Al menos una mayúscula y una minúscula
                </li>
                <li
                  className={hasMinLength ? "text-green-600" : "text-red-500"}
                >
                  Mínimo 8 caracteres
                </li>
                <li className={hasNumber ? "text-green-600" : "text-red-500"}>
                  Al menos un número
                </li>
                <li className={hasSpecialChar ? "text-green-600" : "text-red-500"}>
                  Al menos un carácter especial (e.g., !@#$%^&*)
                </li>
              </ul>

              {/* Botón cambiar */}
              <button
                disabled={!(hasUpperLower && hasNumber && hasMinLength)}
                onClick={resetPassword}
                className={`w-full py-2 rounded-md transition ${
                  hasUpperLower && hasNumber && hasMinLength
                    ? "bg-[#009CFF] text-white hover:bg-blue-500"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Cambiar Contraseña
              </button>
            </>
          )}

          {/* Step 3 - Reenviar código */}
          {step === 3 && (
            <>
              <p className="py-12 text-base text-gray-600 mb-1">
                Ingresa el correo registrado para reenviarte un nuevo código de
                verificación.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full border rounded-md p-3 mb-14 focus:outline-none focus:ring-2 focus:ring-blue-400 "
              />
              <button
                onClick={resendCode}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Enviar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
