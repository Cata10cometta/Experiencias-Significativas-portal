import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../Api/Services/Auth";
import type { Experience } from "../types/experienceTypes";

interface LineThematic {
  id: number;
  name: string;
}

interface ThematicFormProps {
  value: Experience;
  onChange: (value: Experience) => void;
}


const ThematicForm: React.FC<ThematicFormProps> = ({ value, onChange }) => {
  // Static list - these are NOT in the database, just UI options that save as text in thematicLocation
  const lineasTematicas: LineThematic[] = [
    { id: 1, name: 'CIENCIAS ECONOMICAS Y POLITICAS' },
    { id: 2, name: 'TECNOLOGIA E INFORMATICA' },
    { id: 3, name: 'CIENCIAS NATURALES Y EDUCACIÓN AMBIENTAL' },
    { id: 4, name: 'CIENCIAS SOCIALES, HISTORIA, GEOGRAFÍA, CONSTITUCIÓN POLÍTICA Y DEMOCRACIA' },
    { id: 5, name: 'CONVIVENCIA Y COMPORTAMIENTO' },
    { id: 6, name: 'EDUCACIÓN ARTÍSTICA Y CULTURAL' },
    { id: 7, name: 'EDUCACIÓN ÉTICA Y EN VALORES HUMANOS' },
    { id: 8, name: 'EDUCACIÓN FÍSICA, RECREACIÓN Y DEPORTES' },
    { id: 9, name: 'EDUCACIÓN RELIGIOSA' },
    { id: 10, name: 'EMPRENDIMIENTO' },
    { id: 11, name: 'HUMANIDADES Y LENGUA CASTELLANA' },
    { id: 12, name: 'IDIOMA EXTRANJERO' },
    { id: 13, name: 'MATEMÁTICAS' },
    { id: 14, name: 'FILOSOFÍA' },
    { id: 15, name: 'QUIMICA' }
  ];

  // helpers removed: inputs with character counters have been removed per request

  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold mb-2">Tematica y Desarrollo</h2>
      <p className="text-lg text-gray-600 mb-4">Señale el área principal en la que desarrolla la Experiencia Significativa <span className="text-red-500">*</span></p>

      {/* Checkbox grid (no box styling) */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          {lineasTematicas.map((linea) => {
            // Check if this option is selected (compare by name only, since IDs are just for UI)
            const v: any = value || {};
            const checked = v.thematicLocation === linea.name;

            return (
              <label key={linea.id} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="thematicLine"
                  className="mt-1 h-4 w-4 border-gray-300 rounded-full"
                  checked={checked}
                  onChange={() => {
                    // IMPORTANT: Only save the NAME as string in thematicLocation
                    // DO NOT send thematicLineIds - these IDs don't exist in the database
                    console.log(`📍 Selected thematic line: "${linea.name}"`);
                    onChange({ ...v, thematicLocation: linea.name });
                  }}
                />
                <span className="leading-tight break-words whitespace-normal">{linea.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Educational model box (styled to match screenshot) */}
<div className="mb-6">
  <label className="block mb-2 font-medium">
    Indique el modelo educativo en el que se enmarca el desarrollo de la Experiencia Significativa
  </label>

  <div className="px-0 py-4 bg-transparent border-0">
    <div className="grid grid-cols-3 gap-3 p-0">

      {[
        { id: 'Tradicional', label: 'Tradicional' },
        { id: 'Escuela Nueva', label: 'Escuela Nueva' },
        { id: 'Aceleración del Aprendizaje', label: 'Aceleración del Aprendizaje' },
        { id: 'Caminar en Secundaria', label: 'Caminar en Secundaria' },
        { id: 'Postprimaria', label: 'Postprimaria' },
        { id: 'Círculo del Aprendizaje', label: 'Círculo del Aprendizaje' },
        { id: 'Programa para Jóvenes en Extraedad y Adultos', label: 'Programa para Jóvenes en Extraedad y Adultos' },
        { id: 'Etnoeducativa', label: 'Etnoeducativa' },
        { id: 'Media Rural', label: 'Media Rural' },
      ].map((opt) => {
        const checked = (value as any).Population?.includes(opt.id) || false;

        return (
          <label key={opt.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-green-600 rounded"
              checked={checked}
              onChange={(e) => {
                const current = new Set((value as any).Population || []);
                if (e.target.checked) current.add(opt.id);
                else current.delete(opt.id);

                onChange({
                  ...(value as any),
                  Population: Array.from(current),
                });
              }}
            />

            {/* Aquí agregamos mayúscula al inicio siempre */}
            <span className="leading-tight break-words whitespace-normal">
              {opt.label.charAt(0).toUpperCase() + opt.label.slice(1)}
            </span>
          </label>
        );
      })}
    </div>
  </div>
</div>



      {/* inputs removed per request (kept only checkboxes) */}
      {/* SENA techniques checklist (placed below the last section) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Seleccione la o las Técnicas en articulación con el SENA vinculadas <span className="text-red-500">*</span></label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-3 gap-3 p-0">
            {[
              'Contabilización De Operaciones Contables Y Financieras',
              'Asistencia Administrativa',
              'Mantenimiento De Equipos De Computo',
              'Alistamiento De Laboratorismd E Microbiologia Y Biotecnologia',
              'Cocina (Es Academica)',
              'Operación Turistica',
              'Programación De Software',
              'Mantenimiento E Instalacion De Sistemas Solares Fotovoltaicos',
              'Asesoria Comercial',
              'Asesoria Comercial Y Ventas',
              'Sistemas Teleinformaticos',
              'Servicio De Agencias De Viajes',
              'Mantenimiento Y Ensamblaje De Equipos Electronicos',
              'Implementacion Y Mantenimiento De Equipos Electronicos Industriales',
              'Ensamblaje Y Mantenimiento De Equipos De Computo',
              'Integracion De Contenidos Digitales',
              'Confecciones',
              'Panificacion',
              'Automatizacion De Sistemas Industriales',
              'Sistemas Agropecuarios Ecologicos',
              'Agroindustria',
              'Elaboracion De Productos Alimenticios',
              'Ninguna De Las Anteriores',
            ]
              .map((label) => {
                const id = label; // <-- Guarda el texto tal cual
                const cross = (value as any).CrossCuttingProject || [];
                const checked = Array.isArray(cross) ? cross.includes(label) : false;
                return (
                  <label key={id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-green-600 rounded mt-1"
                      checked={checked}
                      onChange={(e) => {
                        const current = new Set((value as any).CrossCuttingProject || []);
                        if (e.target.checked) current.add(id);
                        else current.delete(id);
                        onChange({ ...(value as any), CrossCuttingProject: Array.from(current) });
                      }}
                    />
                    <span className="leading-tight break-words whitespace-normal">{label}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Grades checklist (placed below SENA, as requested) */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Indique el o los grados en el que se desarrolla la experiencia significativa <span className="text-red-500">*</span></label>
          <div className="px-0 py-4 bg-transparent border-0">
            <div className="grid grid-cols-3 gap-3 p-0">
              {[
                { id: 1, label: 'Primaria Infancia (Jardin-transicion)' },
                { id: 2, label: 'Primaria' },
                { id: 3, label: 'Basic' },
                { id: 4, label: 'Media' },
                { id: 5, label: 'CLEI' },
                { id: 6, label: 'Todas las anteriores' },
              ].map((grade) => {
                // grades: [{ gradeId, description }]
                const gradesArr = Array.isArray((value as any).grades)
                  ? (value as any).grades
                  : [];
                const found = gradesArr.find((g: any) => g.gradeId === grade.id);
                const checked = !!found;
                return (
                  <div key={grade.id} className="flex items-center gap-2 text-sm mb-1">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-green-600 rounded mt-1"
                      checked={checked}
                      onChange={(e) => {
                        let updated = Array.isArray((value as any).grades) ? [...(value as any).grades] : [];
                        if (e.target.checked) {
                          updated.push({ gradeId: grade.id, description: '' });
                        } else {
                          updated = updated.filter((g: any) => g.gradeId !== grade.id);
                        }
                        onChange({ ...(value as any), grades: updated });
                      }}
                    />
                    <span className="leading-tight break-words whitespace-normal">{grade.label}</span>
                    {checked && (
                      <input
                        type="text"
                        className="ml-2 border rounded px-2 py-1 text-xs"
                        placeholder="Descripción"
                        value={found?.description || ''}
                        onChange={e => {
                          const updated = gradesArr.map((g: any) =>
                            g.gradeId === grade.id ? { ...g, description: e.target.value } : g
                          );
                          onChange({ ...(value as any), grades: updated });
                        }}
                        style={{ minWidth: 120 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Population group checklist (placed below grades) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Grupo poblacional que hacen parte de la experiencia significativa <span className="text-red-500">*</span></label>
        <div className="bg-white px-0 py-4">
          <div className="grid grid-cols-3 gap-3 pl-0">
            {[
              { id: 1, label: 'Negritudes' },
              { id: 2, label: 'Afrodescendiente' },
              { id: 3, label: 'Palenquero' },
              { id: 4, label: 'Raizal' },
              { id: 5, label: 'Rom/Gitano' },
              { id: 6, label: 'Víctima del Conflicto' },
              { id: 7, label: 'Discapacidad' },
              { id: 8, label: 'Talentos Excepcionales' },
              { id: 9, label: 'Indígenas' },
              { id: 10, label: 'Trastornos Específicos' },
              { id: 11, label: 'Ninguno de los anteriores' },
            ].map((item) => {
              const existing = Array.isArray((value as any).populationGradeIds)
                ? (value as any).populationGradeIds.map((v: any) => Number(v))
                : [];
              const checked = existing.includes(item.id);
              return (
                <label key={item.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-green-600 rounded mt-1"
                    checked={checked}
                    onChange={(e) => {
                      let current = Array.isArray((value as any).populationGradeIds)
                        ? [...(value as any).populationGradeIds]
                        : [];
                      if (e.target.checked) {
                        if (!current.includes(item.id)) current.push(item.id);
                      } else {
                        current = current.filter((v: any) => v !== item.id);
                      }
                      const payload: any = { ...(value as any), populationGradeIds: current, populationGrades: current.map((id: number) => item.label) };
                      console.debug("ThematicForm - population changed:", current);
                      onChange(payload);
                    }}
                  />
                  <span className="leading-tight break-words whitespace-normal">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

          {/* Support received checklist (new) */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Seleccione de quien o quienes a recibido apoyo para la formulación, fundamentación y/o desarrollo <span className="text-red-500">*</span></label>
            <div className="bg-white px-0 py-4">
              <div className="grid grid-cols-1 gap-3 pl-0">
                {[
                  'Tutor PTA asignado a la Institución Educativa',
                  'Practicante de Universidad pública',
                  'Practicante de Universidad privada',
                  'Empresa del Sector público',
                  'Empresa del sector privado',
                  'Docentes Universitarios',
                  'Ninguno',
                ].map((label) => {
                  const id = label;
                  const existing = Array.isArray((value as any).PedagogicalStrategies)
                    ? (value as any).PedagogicalStrategies.map((v: any) => String(v))
                    : [];
                  const checked = existing.includes(id);
                  return (
                    <label key={id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 rounded mt-1"
                        checked={checked}
                        onChange={(e) => {
                          const current = new Set(existing);
                          if (e.target.checked) current.add(id);
                          else current.delete(id);
                          const arr = Array.from(current);
                          const payload: any = { ...(value as any), PedagogicalStrategies: arr };
                          console.debug("ThematicForm - PedagogicalStrategies changed:", arr);
                          onChange(payload);
                        }}
                      />
                      <span className="leading-tight break-words whitespace-normal">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

      
      
              {/* PEI linkage (radio) - new field inserted below supportReceived) */}
              <div className="mb-6">
                <label className="block mb-2 font-medium">La Experiencia Significativa se encuentra vinculada en el Proyecto Educativo Institucional <span className="text-red-500">*</span></label>
                <div className="px-0 py-4 bg-transparent border-0">
                  <div className="grid grid-cols-1 gap-3 p-0">
                    {[
                      'Sí, Componente pedagógico - Plan de estudios',
                      'Sí, Componente pedagógico - Proyectos Pedagógicos Transversales',
                      'Sí, Componente pedagógico - Experiencias Significativas',
                      'Sí, Componente pedagógico -Proyectos de Investigación - Ondas',
                      'Sí , Componente Gestión Comunitaria',
                      'No',
                    ].map((label) => {
                     const id = label;
                      const checked = (value as any).Coverage === id || (value as any).CoverageText === label;
                      return (
                        <label key={id} className="flex items-start gap-2 text-sm">
                          <input
                            type="radio"
                            name="peiComponent"
                            className="mt-1 h-4 w-4 border-gray-300 rounded-full"
                            checked={checked}
                            onChange={() => {
                              const payload: any = { ...(value as any), Coverage: id, CoverageText: label };
                              onChange(payload);
                            }}
                          />
                          <span className="leading-tight break-words whitespace-normal">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

    {/* Recognition (radio) - added per request */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">¿La Experiencia significativa ha tenido algún reconocimiento? <span className="text-red-500">*</span></label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-1 gap-3 p-0">
            {[
              'Sí, al interior de la Institución Educativa',
              'Sí, por parte de una entidad privada o pública externa',
              'Aún no cuenta con reconocimiento',
            ].map((label) => {
              const id = label;
              const checked = (value as any).recognition === id || (value as any).recognitionText === label;
              return (
                <label key={id} className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="recognition"
                    className="mt-1 h-4 w-4 border-gray-300 rounded-full"
                    checked={checked}
                    onChange={() => {
                      const payload: any = { ...(value as any), recognition: id, recognitionText: label };
                      onChange(payload);
                    }}
                  />
                  <span className="leading-tight break-words whitespace-normal">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Experience assets / supports (checkboxes) - added per request */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">La Experiencia Significativa cuenta con: <span className="text-red-500">*</span></label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-1 gap-3 p-0">
            {[
              'Producciones (videos, cuentas de redes sociales)',
              'Publicaciones (libros, paginas web, software, cartillas)',
              'Constancia de participación en eventos de divulgación',
              'Ninguna de las anteriores',
            ].map((label) => {
             const id = label;
              const existing = Array.isArray((value as any).socialization)
                ? (value as any).socialization.map((v: any) => String(v))
                : Array.isArray((value as any).socializationLabels)
                ? (value as any).socializationLabels.map((v: any) => String(v))
                : [];
              const checked = existing.includes(id);
              return (
                <label key={id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-green-600 rounded mt-1"
                    checked={checked}
                    onChange={(e) => {
                      const current = new Set(existing);
                      if (e.target.checked) current.add(id);
                      else current.delete(id);
                      const arr = Array.from(current);
                      const payload: any = { ...(value as any), socialization: arr, socializationLabels: arr };
                      console.debug("ThematicForm - socialization changed:", arr);
                      onChange(payload);
                    }}
                  />
                  <span className="leading-tight break-words whitespace-normal">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>

  );
};

export default ThematicForm;
