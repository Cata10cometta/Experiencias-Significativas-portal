import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Widgets from "../components/Widgets";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import Tracking from "../components/Tracking";
import Experiences from "../components/Experiences";
import AddExperience from "../components/AddExperience"; // <-- nuevo
import Evaluation from "../components/Evaluation";
import UserList from "../components/Security/UserList";
import RolesList from "../components/Security/RolesList";
import Permissions from "../components/Security/Permissions";
import Modules from "../components/Security/Modules";
import Forms from "../components/Security/Forms";
import UsersRol from "../components/Security/UsersRol";
import FormModule from "../components/Security/FormModule";
import PersonsList from "../components/Security/PersonsList";
import RolFormPermission from "../components/Security/RolFormPermission";
import Criteria from "../components/Parameter/Criteria";
import Grade from "../components/Parameter/Grade";
import LineThematic from "../components/Parameter/LineThematic";
import PopulationGrade from "../components/Parameter/PopulationGrade";
import State from "../components/Parameter/State";
import SessionExpiredModal from "../components/SessionExpiredModal";
import { setSessionExpiredHandler } from "../Api/Config/Config";

const DashboardAdmin: React.FC = () => {
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
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <TopBar />
      <Sidebar setActiveContent={setActiveContent} />

      <main className="flex-1 p-8 transition-all duration-300 ease-in-out overflow-hidden">
        {activeContent === "dashboard" && <Widgets />}
        {activeContent === "tracking" && <Tracking />}
        {activeContent === "evaluation" && <Evaluation />}
        {activeContent === "users" && <UserList />}
        {activeContent === "roles" && <RolesList />}
        {activeContent === "permissions" && <Permissions />}
        {activeContent === "modules" && <Modules />}
        {activeContent === "forms" && <Forms />}
        {activeContent === "usersRol" && <UsersRol />}
        {activeContent === "formModule" && <FormModule />}
        {activeContent === "persons" && <PersonsList />}
        {activeContent === "rolFormPermission" && <RolFormPermission />}
        {activeContent === "criteria" && <Criteria />}
        {activeContent === "grade" && <Grade />}
        {activeContent === "lineThematic" && <LineThematic />}
        {activeContent === "populationGrade" && <PopulationGrade />}
        {activeContent === "state" && <State />}
        {activeContent === "experiences" && (
          <Experiences onAgregar={() => setActiveContent("agregar-experiencia")} />
        )}
        {activeContent === "agregar-experiencia" && (
          <AddExperience onVolver={() => setActiveContent("experiences")} />
        )}
      </main>

      {sessionExpired && <SessionExpiredModal onClose={handleModalClose} />}
    </div>
  );
};

export default DashboardAdmin;
