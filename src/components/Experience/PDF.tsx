import type { ExperienceDocument } from "../../Api/Types/experienceTypes";
import React, { useRef, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const PDFUploader: React.FC<{
  value: Partial<ExperienceDocument>;
  onChange: (doc: Partial<ExperienceDocument> | null) => void;
}> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Convertir archivo a base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No se seleccionó ningún archivo");
      if (file.type !== "application/pdf") throw new Error("Solo se permiten archivos PDF");

      setSelectedFile(file);
      const base64 = await toBase64(file);

      onChange({
        ...value,
        name: file.name,
        urlPdf: base64,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al cargar el PDF");
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const file = e.dataTransfer.files[0];
      if (!file) throw new Error("No se seleccionó ningún archivo");
      if (file.type !== "application/pdf") throw new Error("Solo se permiten archivos PDF");

      setSelectedFile(file);
      const base64 = await toBase64(file);

      onChange({
        ...value,
        name: file.name,
        urlPdf: base64,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al cargar el PDF");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {errorMessage && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <label className="block font-semibold mb-2">ADJUNTAR PDF</label>
      <div
        className="bg-gray-50 border rounded-xl flex flex-col justify-center items-center h-64 cursor-pointer relative"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {selectedFile && (
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              onChange(null);
            }}
            aria-label="Quitar PDF"
          >
            <IoClose />
          </button>
        )}

        <FaRegFilePdf className="mb-4 text-red-600" style={{ fontSize: 120 }} />
        <span className="text-gray-500">
          {selectedFile ? selectedFile.name : "Haz click o arrastra tu PDF aquí"}
        </span>
      </div>

      

      {/* Campo de URL */}
      <div className="mt-4">
        <label className="font-semibold">Espacios de divulgación</label>
        <p className="text-sm text-gray-600 mb-1">
          Registre los enlaces públicos donde se encuentre alojada la experiencia significativa (videos, blogs, página web).
        </p>
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          value={value?.urlLink ?? ""}
          onChange={(e) => {
            try {
              onChange({ ...value, urlLink: e.target.value });
            } catch (err: any) {
              setErrorMessage("Error al actualizar el enlace: " + (err?.message || ""));
            }
          }}
        />
      </div>
    </div>
  );
};

export default PDFUploader;

