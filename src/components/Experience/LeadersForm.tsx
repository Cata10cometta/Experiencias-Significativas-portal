import React from "react";
import { Experience } from "../../Api/Types/experienceTypes";

interface LeadersFormProps {
  value: Experience[];
  onChange: (lideres: Experience[]) => void;
}

const MAX_CHARACTERS = {
  nameFirstLeader: 50,
  firstIdentityDocument: 10,
  firdtEmail: 100, // No hay límite en el backend, pero se puede ajustar si es necesario
  firstPosition: 20,
  firstPhone: 10,
  nameSecondLeader: 50,
  secondIdentityDocument: 10,
  secondEmail: 100,
  secondPosition: 50,
  secondPhone: 10,
};

const LeadersForm: React.FC<LeadersFormProps> = ({ value, onChange }) => {
  const handleChange = (index: number, field: keyof Experience, newValue: string) => {
    const nuevosLideres = [...value];
    (nuevosLideres[index][field] as any) = newValue;
    onChange(nuevosLideres);
  };

  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">
        DATOS DEL LÍDER (ES) DE LA EXPERIENCIA SIGNIFICATIVA
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {value.map((lider, i) => (
          <div key={i}>
            <p className="text-[#00aaff] font-semibold">
              {i === 0 ? "Primer Líder/Autor" : "Segundo Líder/Autor"}
            </p>

            {/* Nombre */}
            <div className="relative">
              <input
                placeholder="Nombre(s) y apellido(s)"
                className="w-full border rounded p-2 mt-1"
                value={i === 0 ? lider.nameFirstLeader || "" : lider.nameSecondLeader || ""}
                maxLength={i === 0 ? MAX_CHARACTERS.nameFirstLeader : MAX_CHARACTERS.nameSecondLeader} // Restricción de caracteres
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  handleChange(
                    i,
                    i === 0 ? "nameFirstLeader" : "nameSecondLeader",
                    val
                  );
                }}
              />
              <span
                className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
                  i === 0 ? lider.nameFirstLeader || "" : lider.nameSecondLeader || "",
                  i === 0 ? MAX_CHARACTERS.nameFirstLeader : MAX_CHARACTERS.nameSecondLeader
                )}`}
              >
                {i === 0
                  ? lider.nameFirstLeader?.length || 0
                  : lider.nameSecondLeader?.length || 0}
                /
                {i === 0
                  ? MAX_CHARACTERS.nameFirstLeader
                  : MAX_CHARACTERS.nameSecondLeader}
              </span>
            </div>

            {/* Documento de identidad */}
            <div className="relative">
              <input
                placeholder="Documento de identidad"
                className="w-full border rounded p-2 mt-2"
                value={
                  i === 0
                    ? lider.firstIdentityDocument || ""
                    : lider.secondIdentityDocument || ""
                }
                maxLength={
                  i === 0
                    ? MAX_CHARACTERS.firstIdentityDocument
                    : MAX_CHARACTERS.secondIdentityDocument
                } // Restricción de caracteres
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Solo números
                  handleChange(
                    i,
                    i === 0
                      ? "firstIdentityDocument"
                      : "secondIdentityDocument",
                    val
                  );
                }}
              />
              <span
                className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
                  i === 0
                    ? lider.firstIdentityDocument || ""
                    : lider.secondIdentityDocument || "",
                  i === 0
                    ? MAX_CHARACTERS.firstIdentityDocument
                    : MAX_CHARACTERS.secondIdentityDocument
                )}`}
              >
                {i === 0
                  ? lider.firstIdentityDocument?.length || 0
                  : lider.secondIdentityDocument?.length || 0}
                /
                {i === 0
                  ? MAX_CHARACTERS.firstIdentityDocument
                  : MAX_CHARACTERS.secondIdentityDocument}
              </span>
            </div>

            {/* Correo electrónico */}
            <input
              placeholder="Correo electrónico"
              className="w-full border rounded p-2 mt-2"
              value={i === 0 ? lider.firdtEmail || "" : lider.secondEmail || ""}
              onChange={(e) =>
                handleChange(
                  i,
                  i === 0 ? "firdtEmail" : "secondEmail",
                  e.target.value
                )
              }
            />

            {/* Cargo */}
            <div className="relative">
              <input
                placeholder="Cargo"
                className="w-full border rounded p-2 mt-2"
                value={i === 0 ? lider.firstPosition || "" : lider.secondPosition || ""}
                maxLength={
                  i === 0
                    ? MAX_CHARACTERS.firstPosition
                    : MAX_CHARACTERS.secondPosition
                } // Restricción de caracteres
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  handleChange(
                    i,
                    i === 0 ? "firstPosition" : "secondPosition",
                    val
                  );
                }}
              />
              <span
                className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
                  i === 0 ? lider.firstPosition || "" : lider.secondPosition || "",
                  i === 0 ? MAX_CHARACTERS.firstPosition : MAX_CHARACTERS.secondPosition
                )}`}
              >
                {i === 0
                  ? lider.firstPosition?.length || 0
                  : lider.secondPosition?.length || 0}
                /
                {i === 0
                  ? MAX_CHARACTERS.firstPosition
                  : MAX_CHARACTERS.secondPosition}
              </span>
            </div>

            {/* Teléfono */}
            <input
              placeholder="Teléfono"
              className="w-full border rounded p-2 mt-2"
              value={i === 0 ? lider.firstPhone || "" : lider.secondPhone || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // Solo números
                handleChange(
                  i,
                  i === 0 ? "firstPhone" : "secondPhone",
                  val
                );
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadersForm;

