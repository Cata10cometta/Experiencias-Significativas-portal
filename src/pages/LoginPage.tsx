// src/pages/LoginPage.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { login, saveToken } from "../Api/Config/Config";


type FormData = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar token y rol antiguos al entrar a login
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await login(data.username, data.password);
      console.log("Respuesta login:", response);

      // Extraer datos del backend (ajusta los nombres de campos si es necesario)
      const apiData = response.data?.data || response.data || response;
      const token = apiData.token || apiData.accessToken || apiData.jwt;
      const userId = apiData.userId || apiData.id || apiData.userID;
      const role = apiData.role || "";
      const userName = apiData.userName || "";
      if (userName) localStorage.setItem("userName", userName);

      if (!token || !userId) {
        Swal.fire({
          title: "Error",
          text: "Usuario o contraseña incorrectos",
          icon: "error",
        });
        return;
      }

      // Guardar token y userId
      saveToken(token, 60);
      localStorage.setItem("userId", userId.toString());
      if (role) localStorage.setItem("role", role);

      // Guardar solo los datos disponibles de la persona
      const personData = {
        nombre: apiData.userName || "",
        correo: apiData.email || "",
        cargo: role,
        documento: apiData.personId || "",
        telefono: "" // No disponible en la respuesta
      };
      localStorage.setItem("person", JSON.stringify(personData));


      Swal.fire({
  title: "Éxito",
  text: "Has iniciado sesión correctamente",
  icon: "success",
  confirmButtonText: "Continuar",
}).then(() => {
  // Redirigir según el rol
  role.forEach((role: string) => {
    if (role && role.toLowerCase() === "profesor") {
    navigate("/dashboardTeacher");
  } else {
    navigate("/dashboard");
  }
  });
  
});

    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err.response?.data || err.message || "Error desconocido",
        icon: "error",
      });
    }
  };

  return (
     <div>        
      <img src= "/images/Cohete.png" alt="Descripción de la imagen" className="w-600" 
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
    
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b">
      <div className="bg-white p-8 rounded-lg shadow-md w-90 h-90">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              placeholder="Nombre de usuario"
              type="text"
              {...register("username", { required: "El Username es requerido" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mt-10"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>

          <div>
            <input
              placeholder="Contraseña"
              type="password"
              {...register("password", { required: "La contraseña es requerida" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#00aaff] text-white py-2 px-4 hover:bg-[#00aaff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00aaff] mt-4 !rounded-xl "
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/reset-password" className="text-indigo-600 hover:text-indigo-500">
            ¿Se te olvidó tu contraseña? <br />
          </Link>
          <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </div>
    </div>
    </div>
  );
};

export default LoginPage;