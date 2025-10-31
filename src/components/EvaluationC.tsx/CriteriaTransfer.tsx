import React from "react";
import { Evaluation, CriteriaEvaluation } from "../../Api/Types/evaluation";

interface CriteriaTransferProps {
  value: Evaluation;
  onChange: (newValue: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaTransfer: React.FC<CriteriaTransferProps> = ({ value, onChange, errors }) => {
  // Definimos el id único de este criterio
  const CRITERIA_ID = 9; // ID real para Transferencia

  // Buscamos si ya existe este criterio en la evaluación
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
			deletedAt: ""
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
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Transferencia</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        {/* Texto descriptivo */}
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Transferencia:</span>
          <span className="text-gray-800 font-normal">
            {" "}
            Valora la potencialidad de adaptación, difusión y réplica de la experiencia en otros contextos educativos similares, así como los mecanismos concretos de socialización y apropiación fuera de su espacio original.
          </span>
        </div>
        <p className="mb-2 text-gray-800">
          
Solo podrá seleccionar un Estado y valorar de manera cuantitativa  de acuerdo a su concepto como tutor/evaluador, al igual  podrá  realizar aportes  para el mejoramiento.  Una vez realizada la valoración,  las demás preguntas se debe seleccionar{" "}
          <span className="font-bold">No aplica.</span>
        </p>
        <p className="mb-6 text-gray-800">
          Faltan procesos, metodologías, mecanismos o medios para dar a conocer dentro del establecimiento educativo la concepción, el desarrollo y los resultados de la experiencia.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2, -1].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="transferencia1"
                className="custom-radio"
                value={val}
                checked={criteria.score === val}
                onChange={() => updateScore(val)}
              />
              <span className="ml-2">{val === -1 ? "No aplica" : val}</span>
            </label>
          ))}
        </div>

        {/* Segundo bloque */}
        <div className="mt-12 mb-8">
          <p className="mb-6 text-gray-800">Se han institucionalizado procesos, metodologías, mecanismos o medios de difusión con el fin de dar a conocer en la comunidad educativa la concepción, el desarrollo y los resultados de la experiencia significativa para la socialización en nuevos escenarios educativos. Diferentes procesos, metodologías, mecanismos, medios o aprendizajes de la experiencia significativa se han transferido de manera exitosa dentro y fuera del EE</p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="transferencia2"
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
            Aportes para el mejoramiento (Si no hay aportes favor escribir "NO APLICA")
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3]"
            placeholder="Tu respuesta"
            value={criteria.descriptionContribution ?? ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          {errors.descriptionContributionTransfer && (
            <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionTransfer}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CriteriaTransfer;
