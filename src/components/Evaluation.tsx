import React, { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Button } from "@mui/material";
import axios from "axios";
import Modal from "@mui/material/Modal"; // Importar Modal de Material-UI
import Box from "@mui/material/Box"; // Importar Box para estilos del modal
import type { Evaluation } from "../Api/Types/evaluation";
import EvaluatorInfo from "./EvaluationC.tsx/EvaluatorInfo";
import ExperienceInfo from "./EvaluationC.tsx/ExperienceInfo";
import CriterioPertinencia from "./EvaluationC.tsx/CriterioPertinencia";
import CriteriaFoundation from "./EvaluationC.tsx/CriteriaFoundation";
import CriteriaInnovation from "./EvaluationC.tsx/CriteriaInnovation";
import CriteriaResults from "./EvaluationC.tsx/CriteriaResults";
import CriteriaEmpowerment from "./EvaluationC.tsx/CriteriaEmpowerment";
import CriteriaMonitoring from "./EvaluationC.tsx/CriteriaMonitoring";
import CriteriaTransformation from "./EvaluationC.tsx/CriteriaTransformation";
import CriteriaSustainability from "./EvaluationC.tsx/CriteriaSustainability ";
import CriteriaTransfer from "./EvaluationC.tsx/CriteriaTransfer";
import CriteriaFinalConcept from "./EvaluationC.tsx/CriteriaFinalConcept";
import type { Experience, Institution } from "../Api/Types/experienceTypes";

interface EvaluationProps {
    experienceId?: number | null;
    experiences?: Experience[];
}

function Evaluation({ experienceId, experiences = [] }: EvaluationProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [form, setForm] = useState<Evaluation>({
        evaluationId: 0,
        typeEvaluation: "",
        accompanimentRole: "",
        comments: "",
        evaluationResult: "",
        experienceId: experienceId ?? 0,
        experienceName: "",
        stateId: 0,
        institutionName: "",
        criteriaEvaluations: [],
        thematicLineNames: [],
        userId: Number(localStorage.getItem("userId")) || 0
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({}); // Estado para errores
    const [evaluationResult, setEvaluationResult] = useState<string | null>(null); // Estado para el resultado de la evaluación
    const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal

    const steps = [
        "Evaluador",
        "Experiencia",
        "Pertinencia",
        "Fundamentación",
        "Innovación",
        "Resultados",
        "Empoderamiento",
        "Monitoreo",
        "Transformación",
        "Sostenibilidad",
        "Transferencia",
        "Concepto Final"
    ];

    // Sincroniza experienceId y rellena los campos de ExperienceInfo
    useEffect(() => {
        if (experienceId && experiences.length > 0) {
            const exp = experiences.find(e => e.id === experienceId);
            if (exp) {
                console.log('Experiencia seleccionada:', exp);
                setForm(prev => ({
                    ...prev,
                    experienceId: exp.id,
                    institutionName: exp.institution?.name || "",
                    experienceName: exp.nameExperiences || "",
                    thematicLineNames: exp.thematicLineIds ? exp.thematicLineIds.map(id => id.toString()) : [],
                    stateId: exp.stateId || 0
                }));
            }
        }
    }, [experienceId, experiences]);

    // Sincroniza el experienceId recibido por props con el modelo de evaluación
    useEffect(() => {
        if (experienceId && experienceId !== form.experienceId) {
            setForm(prev => ({ ...prev, experienceId }));
        }
    }, [experienceId]);

    const validateStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (activeStep === 0) {
            // Validación para el paso "Evaluador"
            if (!form.accompanimentRole) {
                newErrors.accompanimentRole = "El rol en el acompañamiento es obligatorio.";
            }
            if (!form.typeEvaluation) {
                newErrors.typeEvaluation = "El tipo de evaluación es obligatorio.";
            }
            if (!form.comments) {
                newErrors.comments = "El comentario es obligatorio."; // Validación para comentarios
            }
        } else if (activeStep === 1) {
            // Validación para el paso "Experiencia"
            if (!form.experienceName) {
                newErrors.experienceName = "El nombre de la experiencia es obligatorio.";
            }
            if (!form.institutionName) {
                newErrors.institutionName = "El nombre de la institución es obligatorio.";
            }
        } else if (activeStep === 2) {
            const criteriaPertinencia = form.criteriaEvaluations?.find((c) => c.criteriaId === 1);
            if (!criteriaPertinencia || !criteriaPertinencia.descriptionContribution.trim()) {
                newErrors.descriptionContributionPertinencia = "El campo de aportes es obligatorio."; // Validación para Pertinencia
            }
        } else if (activeStep === 3) {
            const criteriaFoundation = form.criteriaEvaluations?.find((c) => c.criteriaId === 2);
            if (!criteriaFoundation || !criteriaFoundation.descriptionContribution.trim()) {
                newErrors.descriptionContributionFoundation = "El campo de aportes es obligatorio."; // Validación para Fundamentación
            }
        } else if (activeStep === 4) {
            const criteriaInnovation = form.criteriaEvaluations?.find((c) => c.criteriaId === 3);
            if (!criteriaInnovation || !criteriaInnovation.descriptionContribution.trim()) {
                newErrors.descriptionContributionInnovation = "El campo de aportes es obligatorio."; // Validación para Innovación
            }
        } else if (activeStep === 5) {
            const criteriaResultados = form.criteriaEvaluations?.find((c) => c.criteriaId === 4);
            if (!criteriaResultados || !criteriaResultados.descriptionContribution.trim()) {
                newErrors.descriptionContributionResultados = "El campo de aportes es obligatorio."; // Validación para Resultados
            }
        } else if (activeStep === 6) {
            const criteriaEmpowerment = form.criteriaEvaluations?.find((c) => c.criteriaId === 5);
            if (!criteriaEmpowerment || !criteriaEmpowerment.descriptionContribution.trim()) {
                newErrors.descriptionContributionEmpowerment = "El campo de aportes es obligatorio."; // Validación para Empoderamiento
            }
        } else if (activeStep === 7) {
            const criteriaMonitoring = form.criteriaEvaluations?.find((c) => c.criteriaId === 6);
            if (!criteriaMonitoring || !criteriaMonitoring.descriptionContribution.trim()) {
                newErrors.descriptionContributionMonitoring = "El campo de aportes es obligatorio."; // Validación para Monitoreo
            }
        } else if (activeStep === 8) {
            const criteriaTransformation = form.criteriaEvaluations?.find((c) => c.criteriaId === 7);
            if (!criteriaTransformation || !criteriaTransformation.descriptionContribution.trim()) {
                newErrors.descriptionContributionTransformation = "El campo de aportes es obligatorio."; // Validación para Transformación
            }
        } else if (activeStep === 9) {
            const criteriaSustainability = form.criteriaEvaluations?.find((c) => c.criteriaId === 8);
            if (!criteriaSustainability || !criteriaSustainability.descriptionContribution.trim()) {
                newErrors.descriptionContributionSustainability = "El campo de aportes es obligatorio."; // Validación para Sostenibilidad
            }
        } else if (activeStep === 10) {
            const CriteriaTransfer = form.criteriaEvaluations?.find((c) => c.criteriaId === 9);
            if (!CriteriaTransfer || !CriteriaTransfer.descriptionContribution.trim()) {
                newErrors.descriptionContributionTransfer = "El campo de aportes es obligatorio."; // Validación para Transferencia
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };
    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleChange = (changes: Partial<Evaluation>) => {
        setForm((prev) => ({ ...prev, ...changes }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setError(null);
        const token = localStorage.getItem("token");
        const userId = Number(localStorage.getItem("userId")) || 0;
        const formToSend = { ...form, userId };
        console.log("Formulario a enviar:", formToSend);

        try {
            const response = await axios.post("/api/Evaluation/create", formToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setEvaluationResult(response.data.evaluationResult); // Use backend-provided evaluation result
            setShowModal(true); // Show the modal with the result
        } catch (err) {
            setError("Error al guardar la evaluación");
            setIsSaving(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
        setEvaluationResult(null); // Limpia el resultado de la evaluación
    };

    return (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8 mx-auto">
            {activeStep === 0 && (
                <>
                    <h1 className="text-4xl font-bold !text-[#00aaff]  text-center mt-8">
                        Formulario de Evaluación de Experiencias Significativas
                    </h1>
                </>
            )}

            <div className="mt-8">
                {activeStep === 0 && (
                    <EvaluatorInfo
                        value={form}
                        onChange={handleChange}
                        errors={errors} // Pasar errores como props
                    />
                )}
                {activeStep === 1 && (
                    <ExperienceInfo
                        value={form}
                        onChange={handleChange}
                        errors={errors}
                    />
                )}
                {activeStep === 2 && <CriterioPertinencia value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 3 && <CriteriaFoundation value={form} onChange={handleChange}
                errors={errors} />}
                {activeStep === 4 && <CriteriaInnovation value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 5 && <CriteriaResults value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 6 && <CriteriaEmpowerment value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 7 && <CriteriaMonitoring value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 8 && <CriteriaTransformation value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 9 && <CriteriaSustainability value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 10 && <CriteriaTransfer value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 11 && <CriteriaFinalConcept value={form} onChange={handleChange} />}
            </div>
            <div className="flex justify-between mt-8">
                <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Atrás</Button>
                {activeStep < steps.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        color="primary"
                    >
                        Siguiente
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} variant="contained" color="success" disabled={isSaving}>
                        {isSaving ? "Enviando..." : "Enviar"}
                    </Button>
                )}
            </div>
            {error && <div className="text-red-500 text-center mt-4">{error}</div>}

            {/* Modal para mostrar el resultado de la evaluación */}
            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <h2 className="text-2xl font-bold text-center mb-4">Resultado de la Evaluación</h2>
                    <p className="text-center text-green-500 font-semibold">{evaluationResult}</p>
                    <div className="flex justify-center mt-4">
                        <Button variant="contained" color="primary" onClick={handleCloseModal}>
                            Cerrar
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default Evaluation;
