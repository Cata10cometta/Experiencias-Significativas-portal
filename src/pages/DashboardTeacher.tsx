import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import Experiences from "../components/Experiences";
import StarT from "../components/starT";
import AgregarExperiencia from "../components/AddExperience"; // <-- nuevo
import SessionExpiredModal from "../components/SessionExpiredModal";
import { setSessionExpiredHandler } from "../Api/Config/Config";

const DashboardTeacher: React.FC = () => {
  const [activeContent, setActiveContent] = useState("dashboard");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setSessionExpiredHandler(setSessionExpired); // Configurar el manejador del modal
  }, []);

  const handleModalClose = () => {
    setSessionExpired(false);
    window.location.href = "/login"; // Redirigir al login
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-cover bg-center">
      <TopBar />
      <Sidebar setActiveContent={setActiveContent} />

      <main className="flex-1 p-8 transition-all duration-300 ease-in-out overflow-hidden bg-transparent">
        {activeContent === "dashboard" && <StarT />}
        {activeContent === "experiences" && (
          <Experiences onAgregar={() => setActiveContent("agregar-experiencia")} />
        )}
        {activeContent === "agregar-experiencia" && (
          <AgregarExperiencia onVolver={() => setActiveContent("experiences")} />
        )}
      </main>

      {sessionExpired && <SessionExpiredModal onClose={handleModalClose} />}
    </div>
  );
};

export default DashboardTeacher;
