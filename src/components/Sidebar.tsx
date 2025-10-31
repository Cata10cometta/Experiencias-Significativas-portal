// src/components/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineComputer } from "react-icons/md";
import { LuFileSpreadsheet } from "react-icons/lu";
import { IoPersonSharp } from "react-icons/io5";
import { TbUserScan } from "react-icons/tb";
import { RiAdminLine } from "react-icons/ri";
import { fetchMenu, MenuItem } from "../Api/Services/menuService";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  setActiveContent: (content: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContent, setActive] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
   const navigate = useNavigate();

  useEffect(() => {
    const userId = Number(localStorage.getItem("userId"));
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    fetchMenu(userId, token)
      .then(setMenu)
      .catch(() => setMenu([]));
  }, []);

  const handleSelect = (content: string) => {
    setActive(content);
    setActiveContent(content);
    setIsOpen(false);
  };

  // Agrupar el menú por módulo
  const groupedMenu: { [moduleName: string]: MenuItem[] } = menu.reduce((acc, item) => {
    const moduleName = item.module || "Sin módulo";
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(item);
    return acc;
  }, {} as { [moduleName: string]: MenuItem[] });

  // Estado para controlar el despliegue de cada módulo
  const [openModules, setOpenModules] = useState<{ [moduleName: string]: boolean }>({});

  const toggleModule = (moduleName: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 text-2xl text-gray-700 hover:text-indigo-600"
      >
        <FaBars />
      </button>

      {/* Fondo oscuro detrás del sidebar */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-24 rounded-t-lg right-4 h-full w-90 bg-gray-200 shadow-md transform transition-transform duration-300 ease-in-out z-30
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-center mt-8 mb-8">
          <img
            src="../../public/images/CoheteEx.png"
            alt="Logo"
            className="w-20 h-16 object-contain mr-4"
          />
          <p className="text-[#00aaff] text-2xl font-semibold">
            Gestión de <br /> Experiencias Significativas
          </p>
        </div>

  <nav className="mt-20 overflow-y-auto scrollbar-hide" style={{maxHeight: '60vh'}}>
          {Object.keys(groupedMenu).map((moduleName) => (
            <div key={moduleName} className="mb-6">
              <button
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded font-semibold text-gray-700 hover:bg-gray-200 focus:outline-none"
                onClick={() => toggleModule(moduleName)}
              >
                <span>{moduleName}</span>
                <span>{openModules[moduleName] ? <FaBars /> : <FaBars style={{ transform: 'rotate(90deg)' }} />}</span>
              </button>
              {openModules[moduleName] && (
                <ul className="mt-2">
                  {groupedMenu[moduleName]
                    .filter((item) => {
                      const name = item.form?.toLowerCase();
                      return name !== "evaluation" && name !== "evaluación";
                    })
                    .map((item) => (
                      <li key={item.formId}>
                        <button
                          onClick={() => handleSelect(item.path)}
                          className={`flex items-center px-2 py-2 w-full rounded-full transition-colors duration-200 group text-sm min-h-[36px]
                            ${activeContent === item.path
                              ? "bg-white text-sky-500 font-semibold border-l-4 border-sky-500 rounded-e-full"
                              : "text-black hover:bg-white hover:text-sky-500 hover:border-l-4 hover:border-sky-500 hover:rounded-e-full"}`}
                        >
                          <span className="-mr-4 flex items-center justify-center w-8 h-8 rounded-full bg-white">
                            {item.form === "Inicio" ? (
                              <AiOutlineHome size={16} />
                            ) : item.form === "Seguimiento" ? (
                              <MdOutlineComputer size={16} />
                            ) : item.form === "Experiencia" ? (
                              <LuFileSpreadsheet size={16} />
                            ) : item.form === "Persons" ? (
                              <IoPersonSharp size={16} />
                            ) : item.form === "Users" ? (
                              <TbUserScan size={16} />
                            ) : item.form === "Roles" ? (
                              <RiAdminLine size={16} />
                            ) : (
                              <svg width="16" height="16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" /></svg>
                            )}
                          </span>
                          <span className="w-full text-center">{item.form}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
