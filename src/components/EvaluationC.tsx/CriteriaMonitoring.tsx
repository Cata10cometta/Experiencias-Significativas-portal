import React from "react";
import { CriteriaEvaluation, Evaluation } from "../../Api/Types/evaluation";

interface CriteriaMonitoringProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaMonitoring: React.FC<CriteriaMonitoringProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 6; // ID real para Seguimiento y valoración

  // Buscar si ya existe este criterio en la evaluación
  const criteria =
    value.criteriaEvaluations.find((c) => c.criteriaId === CRITERIA_ID) ??
    {
      score: 0,
      descriptionContribution: "",
      evaluationId: 0,
      criteriaId: CRITERIA_ID,
      id: 0,
      state: true,
      createdAt: "",
      deletedAt: "",
    };

  const updateScore = (score: number) => {
    const updatedCriteria: CriteriaEvaluation = {
      ...criteria,
      score,
    };

    onChange({
      ...value,
      criteriaEvaluations: [
        ...value.criteriaEvaluations.filter((c) => c.criteriaId !== CRITERIA_ID),
        updatedCriteria,
      ],
    });
  };

  const updateDescription = (desc: string) => {
    const updatedCriteria: CriteriaEvaluation = {
      ...criteria,
      descriptionContribution: desc,
    };

    onChange({
      ...value,
      criteriaEvaluations: [
        ...value.criteriaEvaluations.filter((c) => c.criteriaId !== CRITERIA_ID),
        updatedCriteria,
      ],
    });
  };

  return (
    <section className="w-full px-0 mt-4 min-h-[400px]">
      <div className="bg-[#e9ecef] rounded-t-xl px-8 py-6">
        <h2 className="text-2xl font-bold !text-[#2196f3]">
          Criterio: Seguimiento y Valoración
        </h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">
            Seguimiento y Valoración,
          </span>
          <span className="text-gray-800 font-normal">
            {" "}
            Se refiere al uso sistemático de mecanismos, metodologías e
            instrumentos que permiten monitorear, evaluar periódicamente y
            ajustar la experiencia para garantizar su mejora continua
          </span>
        </div>

        <p className="mb-2 text-gray-800">
          Solo podrá seleccionar un Estado y valorar de manera cuantitativa de
          acuerdo a su concepto como tutor/evaluador, al igual podrá realizar
          aportes para el mejoramiento. Una vez realizada la valoración, las
          demás preguntas se debe seleccionar{" "}
          <span className="font-bold">No aplica.</span>
        </p>

        <p className="mb-6 text-gray-800">
          La metodología y/o mecanismos definidos para realizar el seguimiento y
          la valoración periódica del proceso y los resultados de la experiencia
          significativa están en construcción.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="seguimiento"
                className="custom-radio"
                value={val}
                checked={criteria.score === val}
                onChange={() => updateScore(val)}
              />
              <span className="ml-2">{val}</span>
            </label>
          ))}
        </div>

        {/* Primer bloque extendido */}
        <div className="mt-12 mb-8">
          <p className="mb-6 text-gray-800">
            Existe una metodología y/o mecanismos que permiten realizar
            seguimiento y valoración periódica del proceso y los resultados de
            la experiencia significativa. Se identifican y formulan acciones
            para fortalecer la metodología y/o los mecanismos dirigidos a la
            consecución y el análisis de la información, con el fin de realizar
            el seguimiento y la valoración de la experiencia, involucrando a la
            comunidad educativa.
          </p>
        </div>

        <hr className="my-8 border-gray-300" />

        {/* Segundo bloque */}
        <div className="mb-8">
          <p className="mb-6 text-gray-800">
            Adoptan una metodología y/o mecanismos que se reconocen a nivel
            institucional para efectuar seguimiento y valoración a la ejecución
            de la experiencia significativa, para la transformación de los
            componentes propios de esta y el fortalecimiento de las áreas de
            gestión del establecimiento educativo, que sirvan como referente
            para otros que así lo requieran. En el seguimiento y valoración de
            la experiencia participan diferentes actores de la comunidad
            educativa.
          </p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
              <label
                key={val}
                className="inline-flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="seguimiento2"
                  className="custom-radio"
                  value={val}
                  checked={criteria.score === val}
                  onChange={() => updateScore(val)}
                />
                <span className="ml-2">{val}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-2">
          <label className="block font-semibold !text-[#2196f3] mb-2">
            Aportes para el mejoramiento frente al criterio evaluado Seguimiento
            y valoración (Si no hay aportes favor escribir "NO APLICA")
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3]"
            placeholder="Tu respuesta"
            value={criteria.descriptionContribution ?? ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          {errors.descriptionContributionMonitoring && (
  <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionMonitoring}</p>
)}
        </div>
      </div>
    </section>
  );
};

export default CriteriaMonitoring;
