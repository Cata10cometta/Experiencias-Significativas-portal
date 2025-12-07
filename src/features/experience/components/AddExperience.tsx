import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { getToken } from "../../../Api/Services/Auth";
import { UpdateExperienceRequest } from '../types/updateExperience';
import LeadersForm from "./LeadersForm";
import IdentificationForm from "./IdentificationForm";
import ThematicForm from "./ThematicForm";
import InstitutionalIdentification from "./InstitutionalIdentification";
import FormSection from "./ui/FormSection";
import Components from "./Components";
import FollowUpEvaluation from "./FollowUpEvaluation";
import SupportInformationForm from "./SupportInformationForm";
import PDFUploader from "./PDF";

import type { Grade } from "../types/experienceTypes";


// Utilidad para obtener el userId del token o localStorage
function getUserId(token?: string | null) {
  let userId: any = null;
  const parseJwt = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };
  if (token) {
    const claims = parseJwt(token);
    userId = claims?.id || claims?.userId || claims?.sub || null;
  }
  if (!userId) {
    const storedUserId = Number(localStorage.getItem('userId'));
    if (storedUserId && Number.isFinite(storedUserId) && storedUserId > 0) userId = storedUserId;
  }
  return typeof userId === 'string' ? Number(userId) : userId;
}

/**
 * Funciones de normalización para soportes / monitoreos
 * (adaptadas para el UPDATE: terminan en ...Update según Swagger)
 */
function normalizeSupportInformationForUpdate(info: any) {
  const empty = { summary: "", metaphoricalPhrase: "", testimony: "", followEvaluation: "" };
  if (!info) return empty;

  const coerceToString = (v: any): string => {
    if (v === undefined || v === null) return "";
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) {
      return v
        .map((x) =>
          typeof x === 'string'
            ? x
            : (x && typeof x === 'object'
              ? (x.summary ?? x.monitoringEvaluation ?? x.text ?? "")
              : String(x)
            )
        )
        .filter(Boolean)
        .join("\n");
    }
    if (typeof v === 'object') {
      return String(v.summary ?? v.monitoringEvaluation ?? v.text ?? "");
    }
    return String(v);
  };

  const rawSummary = (() => {
    if (Array.isArray(info.summary) && info.summary.length > 0) return info.summary;
    if (info.summary !== undefined) return info.summary;
    if (info.summaryText) return info.summaryText;
    if (info.monitoringEvaluation) return info.monitoringEvaluation;
    return undefined;
  })();

  return {
    summary: coerceToString(rawSummary),
    metaphoricalPhrase: coerceToString(
      info.metaphoricalPhrase ??
      info.metaphoricalPhraseText ??
      info.metaphoricalPhraseValue
    ),
    testimony: coerceToString(info.testimony ?? info.testimonyText),
    followEvaluation: coerceToString(info.followEvaluation ?? info.followEvaluationText),
  };
}

function normalizeMonitoringForUpdate(mon: any, fallbackSustainability: string | undefined) {
  if (!mon) {
    return { monitoringEvaluation: "", result: "", sustainability: fallbackSustainability || "", tranfer: "" };
  }

if (Array.isArray(mon.summary) && mon.summary.length > 0 && typeof mon.summary[0] === 'object') {
  const first = mon.summary[0];

  return {
    monitoringEvaluation:
      first.monitoringEvaluation ??
      mon.monitoringEvaluation ??
      "",

    result:
      first.result ??
      mon.result ??
      mon.resulsExperience ??
      "",

    sustainability:
      first.sustainability ??
      mon.sustainability ??
      mon.sustainabilityExperience ??
      (fallbackSustainability || ""),

    tranfer:
      first.tranfer ??
      mon.tranfer ??
      "",
  };
}

  return {
    monitoringEvaluation: mon.monitoringEvaluation || "",
    result: mon.result || mon.resulsExperience || "",
    sustainability: mon.sustainability || mon.sustainabilityExperience || fallbackSustainability || "",
    tranfer: mon.tranfer || "",
  };
}

/**
 * 🔧 Función para construir el payload de UPDATE
 *  - Shape plano (NO envuelto en request)
 *  - Coincide con Swagger ExperienceUpdateRequest
 */
function buildExperiencePayload({
  initialData,
  identificacionForm,
  identificacionInstitucional,
  lideres,
  nivelesForm,
  tematicaForm,
  seguimientoEvaluacion,
  informacionApoyo,
  pdfFile,
  userId
}: any): UpdateExperienceRequest {

  // --- LEADERS ---
  const leaders = Array.isArray(lideres)
    ? lideres.map((l: any) => ({
      nameLeaders: l.nameLeaders || l.name || '',
      identityDocument: l.identityDocument || '',
      email: l.email || '',
      position: l.position || '',
      phone: Number(l.phone) || 0
    }))
    : [];

  // --- GRADES UPDATE ---
  const nivelesArray = Object.values(nivelesForm?.niveles || {});
  const gradesUpdate = nivelesArray
    .flatMap((n: any) => n.grados)
    .filter((g: any) => g && typeof g.gradeId === 'number')
    .map((g: any) => ({
      id: g.gradeId,
      code: g.code || '',
      name: g.name || '',
      description: g.description || ''
    }));

  // --- DEVELOPMENT TIME ---
  // El backend espera un DateTime, en JSON va como string ISO
  let devTime = initialData?.developmenttime;
  if (!devTime) {
    devTime = new Date().toISOString();
  } else {
    const parsed = new Date(devTime);
    devTime = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  // --- INSTITUTION UPDATE ---
  const institutionUpdate = {
    name: identificacionInstitucional?.name || initialData?.institution?.name || "",
    address: identificacionInstitucional?.address || initialData?.institution?.address || "",
    phone: Number(identificacionInstitucional?.phone || initialData?.institution?.phone || 0),
    codeDane: identificacionInstitucional?.codeDane || initialData?.institution?.codeDane || "",
    emailInstitucional: identificacionInstitucional?.emailInstitucional || initialData?.institution?.emailInstitucional || "",
    nameRector: identificacionInstitucional?.nameRector || initialData?.institution?.nameRector || "",
    caracteristic: identificacionInstitucional?.caracteristic || initialData?.institution?.caracteristic || "",
    territorialEntity: identificacionInstitucional?.territorialEntity || initialData?.institution?.territorialEntity || "",
    testsKnow: identificacionInstitucional?.testsKnow || initialData?.institution?.testsKnow || "",
    addressInfoRequests: Array.isArray(identificacionInstitucional?.addressInfoRequests)
      ? identificacionInstitucional.addressInfoRequests
      : [],
    communes: Array.isArray(identificacionInstitucional?.communes)
      ? identificacionInstitucional.communes
      : [],
    departaments: Array.isArray(identificacionInstitucional?.departaments)
      ? identificacionInstitucional.departaments
      : [],
    eeZones: Array.isArray(identificacionInstitucional?.eeZones)
      ? identificacionInstitucional.eeZones
      : [],
    municipalities: Array.isArray(identificacionInstitucional?.municipalities)
      ? identificacionInstitucional.municipalities
      : [],
    // En Swagger aparece como string:
    departamentes: identificacionInstitucional?.departamentes ||
      identificacionInstitucional?.departament ||
      initialData?.institution?.departamentes ||
      ""
  };

  // --- DOCUMENTS UPDATE ---
  // Si hay pdfFile en el estado, se usa; si no, se toman los documentos del initialData
  let documentsUpdate: any[] = [];

  if (pdfFile && (pdfFile.urlPdf || pdfFile.urlPdfExperience || pdfFile.urlLink)) {
    const stripDataPrefix = (s: any) => {
      if (!s || typeof s !== 'string') return '';
      const idx = s.indexOf(',');
      if (s.startsWith('data:') && idx > -1) return s.substring(idx + 1);
      return s;
    };
    documentsUpdate = [
      {
        name: pdfFile.name || pdfFile.name2 || "Documento PDF",
        urlLink: pdfFile.urlLink || "",
        urlPdf: stripDataPrefix(pdfFile.urlPdf) || "",
        urlPdfExperience: stripDataPrefix(pdfFile.urlPdfExperience || pdfFile.urlPdf2) || ""
      }
    ];
  } else if (Array.isArray(initialData?.documentsUpdate || initialData?.documents)) {
    const sourceDocs = initialData.documentsUpdate || initialData.documents;
    documentsUpdate = sourceDocs.map((d: any) => ({
      name: d.name || "",
      urlLink: d.urlLink || "",
      urlPdf: d.urlPdf || "",
      urlPdfExperience: d.urlPdfExperience || ""
    }));
  }

  // --- OBJECTIVES UPDATE ---
  // Normalizamos soporte y monitoreo tal como en el create, pero usando los campos *Update*
  const supportSource = (seguimientoEvaluacion && (seguimientoEvaluacion.summary || seguimientoEvaluacion.followEvaluation || seguimientoEvaluacion.testimony))
    ? seguimientoEvaluacion
    : informacionApoyo;

  const supportInfoNormalized = normalizeSupportInformationForUpdate(supportSource);
  const monitoringNormalized = normalizeMonitoringForUpdate(seguimientoEvaluacion, informacionApoyo?.sustainability);

  const objectivesUpdate = [
    {
      descriptionProblem: (initialData?.objectivesUpdate?.[0]?.descriptionProblem) ||
        (initialData?.objectives?.[0]?.descriptionProblem) ||
        (initialData?.descriptionProblem) ||
        (informacionApoyo?.descriptionProblem) ||
        "",
      objectiveExperience: (initialData?.objectivesUpdate?.[0]?.objectiveExperience) ||
        (initialData?.objectives?.[0]?.objectiveExperience) ||
        (informacionApoyo?.objectiveExperience) ||
        "",
      enfoqueExperience: (initialData?.objectivesUpdate?.[0]?.enfoqueExperience) ||
        (initialData?.objectives?.[0]?.enfoqueExperience) ||
        (informacionApoyo?.enfoqueExperience) ||
        "",
      methodologias: (initialData?.objectivesUpdate?.[0]?.methodologias) ||
        (initialData?.objectives?.[0]?.methodologias) ||
        (informacionApoyo?.methodologias) ||
        "",
      innovationExperience: (initialData?.objectivesUpdate?.[0]?.innovationExperience) ||
        (initialData?.objectives?.[0]?.innovationExperience) ||
        (informacionApoyo?.innovationExperience) ||
        "",
      pmi: (initialData?.objectivesUpdate?.[0]?.pmi) ||
        (initialData?.objectives?.[0]?.pmi) ||
        (informacionApoyo?.pmi) ||
        "",
      nnaj: (initialData?.objectivesUpdate?.[0]?.nnaj) ||
        (initialData?.objectives?.[0]?.nnaj) ||
        (informacionApoyo?.nnaj) ||
        "",
      supportInformationsUpdate: [
        {
          summary: supportInfoNormalized.summary || "",
          metaphoricalPhrase: supportInfoNormalized.metaphoricalPhrase || "",
          testimony: supportInfoNormalized.testimony || "",
          followEvaluation: supportInfoNormalized.followEvaluation || ""
        }
      ],
      monitoringsUpdate: [
        {
          monitoringEvaluation: monitoringNormalized.monitoringEvaluation || "",
          result: monitoringNormalized.result || "",
          sustainability: monitoringNormalized.sustainability || "",
          tranfer: monitoringNormalized.tranfer || ""
        }
      ]
    }
  ];

  // --- DEVELOPMENTS UPDATE ---
  const developmentsUpdate = [
    {
      crossCuttingProject: Array.isArray(tematicaForm?.CrossCuttingProject)
        ? tematicaForm.CrossCuttingProject.join(', ')
        : (tematicaForm?.CrossCuttingProject || initialData?.developmentsUpdate?.[0]?.crossCuttingProject || ""),
      population: Array.isArray(tematicaForm?.Population)
        ? tematicaForm.Population.join(', ')
        : (tematicaForm?.Population || initialData?.developmentsUpdate?.[0]?.population || ""),
      pedagogicalStrategies: Array.isArray(tematicaForm?.PedagogicalStrategies)
        ? tematicaForm.PedagogicalStrategies.join(', ')
        : (tematicaForm?.PedagogicalStrategies || initialData?.developmentsUpdate?.[0]?.pedagogicalStrategies || ""),
      coverage: Array.isArray(tematicaForm?.Coverage)
        ? tematicaForm.Coverage.join(', ')
        : (tematicaForm?.Coverage || initialData?.developmentsUpdate?.[0]?.coverage || ""),
      covidPandemic: tematicaForm?.experiencesCovidPandemic ||
        initialData?.developmentsUpdate?.[0]?.covidPandemic ||
        ""
    }
  ];

  // --- POPULATION GRADE IDS (NUMÉRICOS) ---
  const populationGradeIds = Array.isArray(tematicaForm?.populationGradeIds)
    ? tematicaForm.populationGradeIds
      .map((x: any) => {
        const n = Number(x);
        return Number.isNaN(n) ? null : n;
      })
      .filter((x: any) => x !== null)
    : Array.isArray(initialData?.populationGradeIds)
      ? initialData.populationGradeIds
      : [];

  // --- THEMATIC LINE IDS (NUMÉRICOS) ---
  const thematicLineIds = Array.isArray(tematicaForm?.thematicLineIds)
    ? tematicaForm.thematicLineIds
      .map((x: any) => {
        const n = Number(x);
        return Number.isNaN(n) ? null : n;
      })
      .filter((x: any) => x !== null)
    : Array.isArray(initialData?.thematicLineIds)
      ? initialData.thematicLineIds
      : [];

  // --- HISTORY EXPERIENCES UPDATE ---
  const historyExperiencesUpdate = [
    {
      action: "Actualización",
      tableName: "Experience",
      userId: Number(userId) || Number(initialData?.userId) || 0
    }
  ];

  // ===========================
  //  🚀 PAYLOAD FINAL UPDATE
  // ===========================
  const payload: UpdateExperienceRequest = {
    experienceId: initialData?.id ?? initialData?.experienceId ?? 0,
    nameExperiences: identificacionForm?.nameExperience || initialData?.nameExperiences || "",
    code: identificacionForm?.code || initialData?.code || "",
    thematicLocation: identificacionForm?.thematicLocation || initialData?.thematicLocation || "",
    developmenttime: devTime,
    recognition: initialData?.recognition || "",
    socialization: initialData?.socialization || "",
    stateExperienceId: Number(initialData?.stateExperienceId) || Number(identificacionForm?.stateExperienceId) || 1,
    userId: Number(userId) || Number(initialData?.userId) || 0,

    leaders,
    institutionUpdate,
    documentsUpdate,
    objectivesUpdate,
    developmentsUpdate,
    gradesUpdate,
    populationGradeIds: populationGradeIds as number[],
    thematicLineIds: thematicLineIds as number[],
    historyExperiencesUpdate
  };

  console.log("Payload UPDATE a enviar:", payload);
  return payload;
}

interface AddExperienceProps {
  onVolver?: () => void;
  initialData?: any;
  readOnly?: boolean;
  disableValidation?: boolean;
  showBackButton?: boolean;
  editMode?: boolean;
}

const AddExperience: React.FC<AddExperienceProps> = ({
  onVolver,
  initialData = null,
  readOnly = false,
  disableValidation = false,
  showBackButton = true,
}) => {
  // Estado para saber qué sección está en modo edición
  const [editSection, setEditSection] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Estados principales
  const [formData] = useState({
    nameExperiences: "",
    summary: "",
    methodologias: "",
    tranfer: "",
    code: "",
    developmenttime: "",
    recognition: "",
    socialization: "",
    themeExperienceArea: "",
    coordinationTransversalProjects: "",
    pedagogicalStrategies: "",
    coverage: "",
    experiencesCovidPandemic: "",
    userId: 0,
    institucionId: 0,
    stateId: 0,
    thematicLineIds: [] as number[],
    gradeIds: [] as number[],
    populationGradeIds: [] as number[],
    documents: [] as any[],
    objectives: [] as any[],
    historyExperiences: [] as any[],
  });

  // Estados de subformularios
  const [lideres, setLideres] = useState<any[]>([{}]); // Solo 1 líder
  const [identificacionForm, setIdentificacionForm] = useState<any>({
    estado: "",
    ubicaciones: [],
    otroTema: "",
    thematicLocation: "",
    nameExperience: "",
    development: { days: "", months: "", years: "" },
    thematicFocus: "",
  });
  const [tematicaForm, setTematicaForm] = useState<any>({
    thematicLineIds: [],
    PedagogicalStrategies: "",
    CrossCuttingProject: [],
    Coverage: "",
    population: [],
    experiencesCovidPandemic: ""
  });
  const [nivelesForm, setNivelesForm] = useState<any>({
    niveles: {
      Primaria: { checked: false, grados: [] },
      Secundaria: { checked: false, grados: [] },
      Media: { checked: false, grados: [] }
    },
  });
  const [grupoPoblacional, setGrupoPoblacional] = useState<number[]>([]);
  const [tiempo, setTiempo] = useState<any>({});
  const [objectiveExperience, setObjectiveExperience] = useState<any>({});
  const [seguimientoEvaluacion, setSeguimientoEvaluacion] = useState<any>({});
  const [informacionApoyo, setInformacionApoyo] = useState<any>({});
  const [identificacionInstitucional, setIdentificacionInstitucional] = useState<any>({});
  const [pdfFile, setPdfFile] = useState<any>({});

  // hydrate states when initialData is provided (used for view/edit existing experience)
  useEffect(() => {
    if (!initialData) return;
    try {
      if (initialData.leaders) setLideres(initialData.leaders);
      if (initialData.identificacionForm) setIdentificacionForm(initialData.identificacionForm);
      if (initialData.tematicaForm) setTematicaForm(initialData.tematicaForm);
      if (initialData.nivelesForm) setNivelesForm(initialData.nivelesForm);
      if (initialData.grupoPoblacional) setGrupoPoblacional(initialData.grupoPoblacional);
      if (initialData.tiempo) setTiempo(initialData.tiempo);
      if (initialData.objectiveExperience) setObjectiveExperience(initialData.objectiveExperience);
      if (initialData.seguimientoEvaluacion) setSeguimientoEvaluacion(initialData.seguimientoEvaluacion);
      if (initialData.informacionApoyo) setInformacionApoyo(initialData.informacionApoyo);
      if (initialData.identificacionInstitucional) setIdentificacionInstitucional(initialData.identificacionInstitucional);
      if (initialData.pdfFile) setPdfFile(initialData.pdfFile);
      if (initialData.documents && Array.isArray(initialData.documents) && initialData.documents.length > 0) {
        setPdfFile(initialData.documents[0]);
      }
    } catch (err) {
      console.warn('AddExperience hydrate initialData failed', err);
    }
  }, [initialData]);

  // Sincroniza grupoPoblacional con populationGradeIds de tematicaForm
  useEffect(() => {
    if (Array.isArray(tematicaForm.populationGradeIds)) {
      setGrupoPoblacional(tematicaForm.populationGradeIds);
    }
  }, [tematicaForm.populationGradeIds]);

  // Asegurar que el campo `thematicFocus` esté disponible en identificacionForm
  useEffect(() => {
    if (!initialData) return;
    try {
      const tf = initialData.tematicaForm?.thematicFocus ?? undefined;
      if (tf !== undefined && tf !== null) {
        setIdentificacionForm((prev: any) => ({ ...(prev || {}), thematicFocus: tf }));
      }
    } catch {
      // noop
    }
  }, [initialData]);

  const steps: string[] = [
    "Identificación Institucional",
    "Líder",
    "Identificación Experiencia",
    "Temática y Desarrollo",
    "Componentes",
    "Testimonios / Soportes",
    "Monitoreos",
    "Documentos",
  ];

  // ============================
  // PATCH helpers (UPDATE)
  // ============================
  const doPatch = async (sectionName: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
      const endpoint = `${API_BASE}/api/Experience/patch`;
      const token = localStorage.getItem('token') || getToken?.();
      if (!initialData?.id && !initialData?.experienceId) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID de la experiencia.' });
        return;
      }
      const userId = getUserId(token);
      const payload = buildExperiencePayload({
        initialData,
        identificacionForm,
        identificacionInstitucional,
        lideres,
        nivelesForm,
        tematicaForm,
        seguimientoEvaluacion,
        informacionApoyo,
        pdfFile,
        userId
      });

      console.log(`PATCH [${sectionName}] payload:`, JSON.stringify(payload, null, 2));

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        Swal.fire({ icon: 'error', title: 'Error', text: text || 'No se pudo guardar los cambios.' });
        return;
      }
      Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Cambios guardados correctamente.' });
      setEditSection(null);
    } catch (err: any) {
      const msg = err?.message ??
        (typeof err === 'string'
          ? err
          : (err && typeof err.toString === 'function' ? err.toString() : 'Error al guardar.'));
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  };

  const handlePatchInstitutional = async () => {
    await doPatch("Institutional");
  };
  const handlePatchLeaders = async () => {
    await doPatch("Leaders");
  };
  const handlePatchIdentification = async () => {
    await doPatch("Identification");
  };
  const handlePatchThematic = async () => {
    await doPatch("Thematic");
  };
  const handlePatchComponents = async () => {
    await doPatch("Components");
  };
  const handlePatchFollowUp = async () => {
    await doPatch("FollowUp");
  };
  const handlePatchSupportInfo = async () => {
    await doPatch("SupportInfo");
  };
  const handlePatchDocuments = async () => {
    await doPatch("Documents");
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
    if (disableValidation) return true;
    setFieldErrors({});
    // Step 0: InstitutionalIdentification required fields
    if (currentStep === 0) {
      const inst = identificacionInstitucional || {};
      const errors: Record<string, string> = {};
      
      // Campos principales obligatorios
      if (!inst.codeDane || String(inst.codeDane).trim() === "") errors.codeDane = "Código DANE es obligatorio";
      if (!inst.name || String(inst.name).trim() === "") errors.name = "Nombre del establecimiento es obligatorio";
      if (!inst.nameRector || String(inst.nameRector).trim() === "") errors.nameRector = "Nombre del rector es obligatorio";
      if (!inst.municipality || String(inst.municipality).trim() === "") errors.municipality = "Municipio es obligatorio";
      if (!inst.departament || String(inst.departament).trim() === "") errors.departament = "Departamento es obligatorio";
      
      // Campos adicionales obligatorios
      if (!inst.eZone || String(inst.eZone).trim() === "") errors.eZone = "Zona del EE es obligatoria";
      if (!inst.address || String(inst.address).trim() === "") errors.address = "Dirección es obligatoria";
      if (!inst.phone || String(inst.phone).trim() === "" || inst.phone === 0) errors.phone = "Teléfono de contacto es obligatorio";
      if (!inst.emailInstitucional || String(inst.emailInstitucional).trim() === "") errors.emailInstitucional = "Correo electrónico institucional es obligatorio";
      if (!inst.caracteristic || String(inst.caracteristic).trim() === "") errors.caracteristic = "Características del EE es obligatorio";
      if (!inst.territorialEntity || String(inst.territorialEntity).trim() === "") errors.territorialEntity = "Entidad Territorial Certificada es obligatoria";
      if (!inst.testsKnow || (inst.testsKnow !== "Sí" && inst.testsKnow !== "No")) errors.testsKnow = "Debe seleccionar si participará en el evento";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    // Step 1: Leader required fields
    if (currentStep === 1) {
      const leader = (lideres && lideres[0]) || {};
      const errors: Record<string, string> = {};
      if (!leader.nameLeaders || String(leader.nameLeaders).trim() === "") errors.leaderName = "Nombre del líder es obligatorio";
      if (!leader.identityDocument || String(leader.identityDocument).trim() === "" || leader.identityDocument.length < 8) errors.leaderDocument = "Documento de identidad es obligatorio (mínimo 8 dígitos)";
      if (!leader.email || String(leader.email).trim() === "") errors.leaderEmail = "Correo del líder es obligatorio";
      if (!leader.position || String(leader.position).trim() === "") errors.leaderPosition = "Cargo del líder es obligatorio";
      if (!leader.phone || leader.phone === 0 || String(leader.phone).trim() === "") errors.leaderPhone = "Teléfono del líder es obligatorio";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    // Step 2: Identification required fields
    if (currentStep === 2) {
      const ident = identificacionForm || {};
      const errors: Record<string, string> = {};
      if (!ident.nameExperience || String(ident.nameExperience).trim() === "") errors.nameExperience = "Nombre de la experiencia es obligatorio";
      if (!ident.thematicFocus || String(ident.thematicFocus).trim() === "") errors.thematicFocus = "Enfoque temático es obligatorio";
      const dev = ident.development || {};
      const hasDev = [dev.days, dev.months, dev.years].some(
        (v) => v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(Number(v))
      );
      if (!hasDev) errors.development = "Seleccione el tiempo de desarrollo";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    // Step 3: Temática y Desarrollo
    if (currentStep === 3) {
      const tem = tematicaForm || {};
      const errors: Record<string, string> = {};
      
      if (!tem.thematicLocation || String(tem.thematicLocation).trim() === "") {
        errors.thematicLocation = "Debe seleccionar una línea temática.";
      }
      if (!Array.isArray(tem.Population) || tem.Population.length === 0) {
        errors.Population = "Debe seleccionar al menos un modelo educativo.";
      }
      if (!Array.isArray(tem.CrossCuttingProject) || tem.CrossCuttingProject.length === 0) {
        errors.CrossCuttingProject = "Debe seleccionar al menos una técnica SENA.";
      }
      if (!Array.isArray(tem.grades) || tem.grades.length === 0) {
        errors.grades = "Debe seleccionar al menos un grado.";
      }
      if (!Array.isArray(tem.populationGradeIds) || tem.populationGradeIds.length === 0) {
        errors.populationGradeIds = "Debe seleccionar al menos un grupo poblacional.";
      }
      if (!Array.isArray(tem.PedagogicalStrategies) || tem.PedagogicalStrategies.length === 0) {
        errors.PedagogicalStrategies = "Debe indicar de quién ha recibido apoyo.";
      }
      if (!tem.Coverage || String(tem.Coverage).trim() === "") {
        errors.Coverage = "Debe indicar si está vinculada al PEI.";
      }
      if (!tem.recognition || String(tem.recognition).trim() === "") {
        errors.recognition = "Debe indicar si ha tenido reconocimiento.";
      }
      if (!Array.isArray(tem.socialization) || tem.socialization.length === 0) {
        errors.socialization = "Debe indicar con qué cuenta la experiencia.";
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    return true;
  };

  const isCurrentStepValidSync = (): boolean => {
    if (disableValidation) {
      console.log("⚠️ Validación deshabilitada");
      return true;
    }
    
    // Paso 0: Identificación Institucional
    if (currentStep === 0) {
      const inst = identificacionInstitucional || {};
      console.log("📋 Validando paso 0 - Identificación Institucional:", inst);
      
      // Campos obligatorios principales
      if (!inst.codeDane || String(inst.codeDane).trim() === "") {
        console.log("❌ Falta: Código DANE");
        return false;
      }
      if (!inst.name || String(inst.name).trim() === "") {
        console.log("❌ Falta: Nombre del establecimiento");
        return false;
      }
      if (!inst.nameRector || String(inst.nameRector).trim() === "") {
        console.log("❌ Falta: Nombre del rector");
        return false;
      }
      if (!inst.municipality || String(inst.municipality).trim() === "") {
        console.log("❌ Falta: Municipio");
        return false;
      }
      if (!inst.departament || String(inst.departament).trim() === "") {
        console.log("❌ Falta: Departamento");
        return false;
      }
      
      // Campos adicionales obligatorios
      if (!inst.eZone || String(inst.eZone).trim() === "") {
        console.log("❌ Falta: Zona del EE");
        return false;
      }
      if (!inst.address || String(inst.address).trim() === "") {
        console.log("❌ Falta: Dirección");
        return false;
      }
      if (!inst.phone || String(inst.phone).trim() === "" || inst.phone === 0) {
        console.log("❌ Falta: Teléfono de contacto");
        return false;
      }
      if (!inst.emailInstitucional || String(inst.emailInstitucional).trim() === "") {
        console.log("❌ Falta: Correo electrónico institucional");
        return false;
      }
      if (!inst.caracteristic || String(inst.caracteristic).trim() === "") {
        console.log("❌ Falta: Características del EE");
        return false;
      }
      if (!inst.territorialEntity || String(inst.territorialEntity).trim() === "") {
        console.log("❌ Falta: Entidad Territorial Certificada (ETC)");
        return false;
      }
      if (!inst.testsKnow || (inst.testsKnow !== "Sí" && inst.testsKnow !== "No")) {
        console.log("❌ Falta: Respuesta sobre participación en el evento");
        return false;
      }
      
      console.log("✅ Paso 0 válido - Todos los campos completos");
      return true;
    }
    
    // Paso 1: Líder
    if (currentStep === 1) {
      const leader = (lideres && lideres[0]) || {};
      console.log("📋 Validando paso 1 - Líder:", leader);
      
      if (!leader.nameLeaders || String(leader.nameLeaders).trim() === "") {
        console.log("❌ Falta: Nombre del líder");
        return false;
      }
      if (!leader.identityDocument || String(leader.identityDocument).trim() === "" || leader.identityDocument.length < 8) {
        console.log("❌ Falta: Documento de identidad (mínimo 8 dígitos)");
        return false;
      }
      if (!leader.email || String(leader.email).trim() === "") {
        console.log("❌ Falta: Email del líder");
        return false;
      }
      if (!leader.position || String(leader.position).trim() === "") {
        console.log("❌ Falta: Cargo del líder");
        return false;
      }
      if (!leader.phone || leader.phone === 0 || String(leader.phone).trim() === "") {
        console.log("❌ Falta: Teléfono del líder");
        return false;
      }
      
      console.log("✅ Paso 1 válido - Todos los campos completos");
      return true;
    }
    
    // Paso 2: Identificación de la Experiencia
    if (currentStep === 2) {
      const ident = identificacionForm || {};
      console.log("📋 Validando paso 2 - Identificación Experiencia:", ident);
      
      if (!ident.nameExperience || String(ident.nameExperience).trim() === "") {
        console.log("❌ Falta: Nombre de la experiencia");
        return false;
      }
      if (!ident.thematicFocus || String(ident.thematicFocus).trim() === "") {
        console.log("❌ Falta: Enfoque temático");
        return false;
      }
      
      const dev = ident.development || {};
      const hasDev = [dev.days, dev.months, dev.years].some(
        (v) => v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(Number(v))
      );
      if (!hasDev) {
        console.log("❌ Falta: Tiempo de desarrollo");
        return false;
      }
      
      console.log("✅ Paso 2 válido");
      return true;
    }
    
    // Paso 3: Temática y Desarrollo
    if (currentStep === 3) {
      const tem = tematicaForm || {};
      console.log("📋 Validando paso 3 - Temática:", tem);
      
      // 1. Línea temática (radio)
      if (!tem.thematicLocation || String(tem.thematicLocation).trim() === "") {
        console.log("❌ Falta: Línea temática");
        return false;
      }
      
      // 2. Modelo educativo (checkboxes - al menos uno)
      if (!Array.isArray(tem.Population) || tem.Population.length === 0) {
        console.log("❌ Falta: Modelo educativo");
        return false;
      }
      
      // 3. Técnicas SENA (checkboxes - al menos una)
      if (!Array.isArray(tem.CrossCuttingProject) || tem.CrossCuttingProject.length === 0) {
        console.log("❌ Falta: Técnicas en articulación con SENA");
        return false;
      }
      
      // 4. Grados (checkboxes - al menos uno)
      if (!Array.isArray(tem.grades) || tem.grades.length === 0) {
        console.log("❌ Falta: Grados donde se desarrolla la experiencia");
        return false;
      }
      
      // 5. Grupo poblacional (checkboxes - al menos uno)
      if (!Array.isArray(tem.populationGradeIds) || tem.populationGradeIds.length === 0) {
        console.log("❌ Falta: Grupo poblacional");
        return false;
      }
      
      // 6. Apoyo recibido (checkboxes - al menos uno)
      if (!Array.isArray(tem.PedagogicalStrategies) || tem.PedagogicalStrategies.length === 0) {
        console.log("❌ Falta: Apoyo recibido para formulación/desarrollo");
        return false;
      }
      
      // 7. Vinculación en PEI (radio)
      if (!tem.Coverage || String(tem.Coverage).trim() === "") {
        console.log("❌ Falta: Vinculación en el PEI");
        return false;
      }
      
      // 8. Reconocimiento (radio)
      if (!tem.recognition || String(tem.recognition).trim() === "") {
        console.log("❌ Falta: Reconocimiento de la experiencia");
        return false;
      }
      
      // 9. Activos/soportes de la experiencia (checkboxes - al menos uno)
      if (!Array.isArray(tem.socialization) || tem.socialization.length === 0) {
        console.log("❌ Falta: Activos de la experiencia (producciones, publicaciones, etc.)");
        return false;
      }
      
      console.log("✅ Paso 3 válido - Todos los campos completos");
      return true;
    }
    
    // Paso 4: Componentes
    if (currentStep === 4) {
      const obj = objectiveExperience || {};
      console.log("📋 Validando paso 4 - Componentes:", obj);
      
      // 1. Descripción del problema (textarea)
      if (!obj.descriptionProblem || String(obj.descriptionProblem).trim() === "") {
        console.log("❌ Falta: Descripción del problema");
        return false;
      }
      
      // 2. Objetivo propuesto (textarea)
      if (!obj.objectiveExperience || String(obj.objectiveExperience).trim() === "") {
        console.log("❌ Falta: Objetivo propuesto");
        return false;
      }
      
      // 3. Logros obtenidos (textarea)
      if (!obj.enfoqueExperience || String(obj.enfoqueExperience).trim() === "") {
        console.log("❌ Falta: Logros obtenidos");
        return false;
      }
      
      // 4. Productos generados (textarea)
      if (!obj.methodologias || String(obj.methodologias).trim() === "") {
        console.log("❌ Falta: Productos generados");
        return false;
      }
      
      // 5. Articulación PEI-PMI (radio)
      if (!obj.pmi || String(obj.pmi).trim() === "") {
        console.log("❌ Falta: Articulación con PEI y PMI");
        return false;
      }
      
      // 6. Coherencia con contexto NNAJ (radio)
      if (!obj.nnaj || String(obj.nnaj).trim() === "") {
        console.log("❌ Falta: Coherencia con contexto y necesidades de NNAJ");
        return false;
      }
      
      // 7. Resultados y logros (radio)
      if (!obj.innovationExperience || String(obj.innovationExperience).trim() === "") {
        console.log("❌ Falta: Cuenta con resultados y logros");
        return false;
      }
      
      console.log("✅ Paso 4 válido - Todos los campos completos");
      return true;
    }
    
    // Paso 5: Testimonios/Soportes
    if (currentStep === 5) {
      const info = seguimientoEvaluacion || {};
      console.log("📋 Validando paso 5 - Testimonios/Soportes:", info);
      console.log("📋 Summary:", (info as any).summary);
      console.log("📋 metaphoricalPhrase:", info.metaphoricalPhrase);
      console.log("📋 testimony:", info.testimony);
      console.log("📋 followEvaluation:", info.followEvaluation);
      
      // 1. Reorganización y actualización permanente (radio)
      const monitoringEval = (info as any).summary?.[0]?.monitoringEvaluation || "";
      console.log("📋 monitoringEval extraído:", monitoringEval);
      if (!monitoringEval || String(monitoringEval).trim() === "") {
        console.log("❌ Falta: Reorganización y actualización permanente");
        return false;
      }
      
      // 2. Empoderamiento y participación (radio)
      if (!info.metaphoricalPhrase || String(info.metaphoricalPhrase).trim() === "") {
        console.log("❌ Falta: Empoderamiento y participación");
        return false;
      }
      
      // 3. Recursos novedosos (radio)
      if (!info.testimony || String(info.testimony).trim() === "") {
        console.log("❌ Falta: Recursos novedosos para desarrollo");
        return false;
      }
      
      // 4. Estrategias de permanencia (radio)
      if (!info.followEvaluation || String(info.followEvaluation).trim() === "") {
        console.log("❌ Falta: Estrategias de permanencia y mejora continua");
        return false;
      }
      
      console.log("✅ Paso 5 válido - Todos los campos completos");
      return true;
    }
    
    // Paso 6: Monitoreos
    if (currentStep === 6) {
      const mon = informacionApoyo || {};
      console.log("📋 Validando paso 6 - Monitoreos:", mon);
      
      // 1. Metodologías de referencia (radio)
      if (!mon.monitoringEvaluation || String(mon.monitoringEvaluation).trim() === "") {
        console.log("❌ Falta: Metodologías de referencia");
        return false;
      }
      
      // 2. Mecanismos de seguimiento (radio)
      if (!mon.sustainability || String(mon.sustainability).trim() === "") {
        console.log("❌ Falta: Mecanismos de seguimiento y evaluación");
        return false;
      }
      
      console.log("✅ Paso 6 válido - Todos los campos completos");
      return true;
    }
    
    // Paso 7: Documentos
    if (currentStep === 7) {
      const doc = pdfFile || {};
      console.log("📋 Validando paso 7 - Documentos:", doc);
      
      // 1. PDF Proyecto Experiencia Significativa
      if (!doc.urlPdfExperience && !doc.name) {
        console.log("❌ Falta: PDF Proyecto Experiencia Significativa");
        return false;
      }
      
      // 2. PDF Oficio de presentación
      if (!doc.urlPdf) {
        console.log("❌ Falta: PDF Oficio de presentación");
        return false;
      }
      
      // 3. Link de espacios de divulgación
      if (!doc.urlLink || String(doc.urlLink).trim() === "") {
        console.log("❌ Falta: Enlace de espacios de divulgación");
        return false;
      }
      
      console.log("✅ Paso 7 válido - Todos los documentos completos");
      return true;
    }
    
    console.log("✅ Paso válido (sin validaciones obligatorias)");
    return true;
  };

  const isLastStep = () => currentStep === steps.length - 1;
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // ============================
  // CREATE (register) – sin cambios
  // ============================
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    // GRADES -> convertimos nivelesForm a array y filtramos solo los grados válidos
    const nivelesArray: any[] = Object.values(nivelesForm.niveles);

    const grades: { gradeId: number; description: string }[] = nivelesArray
      .flatMap((nivel) => nivel.grados)
      .filter((g): g is Grade => g !== undefined && typeof g.gradeId === "number")
      .map((g) => ({
        gradeId: g.gradeId as number,
        description: g.description || "",
      }));

    // POPULATION GRADE IDS
    const populationGradeIds = Array.isArray(grupoPoblacional)
      ? grupoPoblacional
      : Array.isArray(tematicaForm?.populationGradeIds)
        ? tematicaForm.populationGradeIds
        : Array.isArray(tematicaForm?.populationGrades)
          ? tematicaForm.populationGrades
          : Array.isArray(tematicaForm?.population)
            ? tematicaForm.population
            : [];

    const populationSlugToId: Record<string, number> = {
      negritudes: 1,
      afrodescendiente: 2,
      palenquero: 3,
      raizal: 4,
      rom_gitano: 5,
      victima_del_conflicto: 6,
      discapacidad: 7,
      talentos_excepcionales: 8,
      indigenas: 9,
      trastornos_especificos: 10,
      ninguno_de_los_anteriores: 11,
    };

    const numericPopulationGradeIds = Array.isArray(populationGradeIds)
      ? populationGradeIds
        .map((v: any) => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'number') return Number.isFinite(v) ? Math.trunc(v) : null;
          if (typeof v === 'string' && v.trim() !== '') {
            const s = v.trim();
            const n = Number(s);
            if (!Number.isNaN(n) && Number.isFinite(n)) return Math.trunc(n);
            const normalized = s.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            return populationSlugToId[normalized] ?? null;
          }
          if (typeof v === 'object') {
            if (v.id) return Number.isFinite(Number(v.id)) ? Math.trunc(Number(v.id)) : null;
            if (v.name) {
              const normalized = String(v.name).toLowerCase().replace(/[^a-z0-9]+/g, '_');
              return populationSlugToId[normalized] ?? null;
            }
          }
          return null;
        })
        .filter((x: any) => x !== null)
      : [];

    const stringPopulationGrades = Array.isArray(populationGradeIds)
      ? populationGradeIds
        .map((v: any) =>
          v === null || v === undefined
            ? ''
            : (typeof v === 'string'
              ? v
              : (typeof v === 'number'
                ? String(v)
                : (v?.name ?? v?.label ?? ''))))
        .filter((s: string) => s && s.length > 0)
      : [];

    // OBJECTIVES (para create)
    const objectives = [
      {
        descriptionProblem: objectiveExperience.descriptionProblem || "",
        objectiveExperience: objectiveExperience.objectiveExperience || "",
        enfoqueExperience: objectiveExperience.enfoqueExperience || "",
        methodologias: objectiveExperience.methodologias || "",
        innovationExperience: objectiveExperience.innovationExperience || "",
        resulsExperience: seguimientoEvaluacion.resulsExperience || "",
        sustainabilityExperience: informacionApoyo.sustainabilityExperience || "",
        tranfer: seguimientoEvaluacion.tranfer || "",
        summary: seguimientoEvaluacion.summary || "",
        metaphoricalPhrase: seguimientoEvaluacion.metaphoricalPhrase || "",
        testimony: seguimientoEvaluacion.testimony || "",
        followEvaluation: seguimientoEvaluacion.followEvaluation || "",
      },
    ];

    // DOCUMENTS (para create)
    const documents = pdfFile
      ? [
        {
          name: pdfFile.name || "Documento PDF",
          urlPdf: pdfFile.urlPdf || "",
          urlLink: pdfFile.urlLink || "",
        },
      ]
      : [];

    const historyExperiences = [
      {
        action: "Creación",
        tableName: "Experience",
      },
    ];

    const documentsSwagger: any[] = [];
    if (pdfFile) {
      const stripDataPrefix = (s: any) => {
        if (!s || typeof s !== 'string') return '';
        const idx = s.indexOf(',');
        if (s.startsWith('data:') && idx > -1) return s.substring(idx + 1);
        return s;
      };

      const rawPdf = pdfFile.urlPdf || "";
      const rawPdfExperience = pdfFile.urlPdf2 || pdfFile.urlPdfExperience || "";
      const doc: any = {
        name: pdfFile.name || pdfFile.name2 || "Documento PDF",
        urlLink: pdfFile.urlLink || "",
        urlPdf: stripDataPrefix(rawPdf) || "",
        urlPdfExperience: stripDataPrefix(rawPdfExperience) || "",
        fileBase64: stripDataPrefix(rawPdf) || undefined,
        fileBase64Experience: stripDataPrefix(rawPdfExperience) || undefined,
      };
      documentsSwagger.push(doc);
    }

    // Normalización soporte / monitoreo (create)
    const normalizeSupportInformation = (info: any) => {
      const empty = { summary: "", metaphoricalPhrase: "", testimony: "", followEvaluation: "" };
      if (!info) return empty;

      const coerceToString = (v: any): string => {
        if (v === undefined || v === null) return "";
        if (typeof v === 'string') return v;
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (Array.isArray(v)) {
          return v
            .map((x) =>
              typeof x === 'string'
                ? x
                : (x && typeof x === 'object'
                  ? (x.summary ?? x.monitoringEvaluation ?? x.text ?? "")
                  : String(x)
                )
            )
            .filter(Boolean)
            .join("\n");
        }
        if (typeof v === 'object') {
          return String(v.summary ?? v.monitoringEvaluation ?? v.text ?? "");
        }
        return String(v);
      };

      const rawSummary = (() => {
        if (Array.isArray(info.summary) && info.summary.length > 0) return info.summary;
        if (info.summary !== undefined) return info.summary;
        if (info.summaryText) return info.summaryText;
        if (info.monitoringEvaluation) return info.monitoringEvaluation;
        return undefined;
      })();

      return {
        summary: coerceToString(rawSummary),
        metaphoricalPhrase: coerceToString(info.metaphoricalPhrase ?? info.metaphoricalPhraseText ?? info.metaphoricalPhraseValue),
        testimony: coerceToString(info.testimony ?? info.testimonyText),
        followEvaluation: coerceToString(info.followEvaluation ?? info.followEvaluationText),
      };
    };

    const normalizeMonitoring = (mon: any) => {
      if (!mon) return { monitoringEvaluation: "", result: "", sustainability: "", tranfer: "" };
      if (Array.isArray(mon.summary) && mon.summary.length > 0 && typeof mon.summary[0] === 'object') {
        const first = mon.summary[0];
        return {
          monitoringEvaluation: first.monitoringEvaluation ?? mon.monitoringEvaluation ?? "",
          result: first.result ?? mon.result ?? mon.resulsExperience ?? "",
          sustainability: first.sustainability ?? mon.sustainability ?? mon.sustainabilityExperience ?? "",
          tranfer: first.tranfer ?? mon.tranfer ?? "",
        };
      }
      return {
        monitoringEvaluation: mon.monitoringEvaluation || "",
        result: mon.result || mon.resulsExperience || "",
        sustainability: mon.sustainability || mon.sustainabilityExperience || "",
        tranfer: mon.tranfer || "",
      };
    };

    const supportSource = (seguimientoEvaluacion && (seguimientoEvaluacion.summary || seguimientoEvaluacion.followEvaluation || seguimientoEvaluacion.testimony))
      ? seguimientoEvaluacion
      : informacionApoyo;
    const supportInfoNormalized = normalizeSupportInformation(supportSource);
    let monitoringNormalized = normalizeMonitoring(seguimientoEvaluacion);
    if (!monitoringNormalized.sustainability && informacionApoyo.sustainability) {
      monitoringNormalized = {
        ...monitoringNormalized,
        sustainability: informacionApoyo.sustainability,
      };
    }

    const objectivesSwagger = [
      {
        descriptionProblem: objectiveExperience.descriptionProblem || "",
        objectiveExperience: objectiveExperience.objectiveExperience || "",
        enfoqueExperience: objectiveExperience.enfoqueExperience || "",
        methodologias: objectiveExperience.methodologias || "",
        innovationExperience: objectiveExperience.innovationExperience || "",
        pmi: objectiveExperience.pmi || "",
        nnaj: objectiveExperience.nnaj || "",
        supportInformations: [
          {
            summary: supportInfoNormalized.summary || "",
            metaphoricalPhrase: supportInfoNormalized.metaphoricalPhrase || "",
            testimony: supportInfoNormalized.testimony || "",
            followEvaluation: supportInfoNormalized.followEvaluation || "",
          },
        ],
        monitorings: [
          {
            monitoringEvaluation: monitoringNormalized.monitoringEvaluation || "",
            result: monitoringNormalized.result || "",
            sustainability: monitoringNormalized.sustainability ?? "",
            tranfer: monitoringNormalized.tranfer || "",
          },
        ],
      },
    ];

    const leadersSwagger = Array.isArray(lideres)
      ? lideres.map((l: any) => ({
        nameLeaders: l.nameLeaders || l.name || "",
        identityDocument: l.identityDocument || l.firstIdentityDocument || "",
        email: l.email || l.firdtEmail || "",
        position: l.position || l.firstPosition || "",
        phone: l.phone || l.firstPhone || 0,
      }))
      : [];

    const developmentsSwagger = [
      {
        crossCuttingProject: Array.isArray(tematicaForm.CrossCuttingProject)
          ? tematicaForm.CrossCuttingProject.join(', ')
          : tematicaForm.CrossCuttingProject || "",
        population: Array.isArray(tematicaForm.Population)
          ? tematicaForm.Population.join(', ')
          : (tematicaForm.Population || ""),
        Population: Array.isArray(tematicaForm.Population)
          ? tematicaForm.Population.join(', ')
          : (tematicaForm.Population || ""),
        pedagogicalStrategies: Array.isArray(tematicaForm.PedagogicalStrategies)
          ? tematicaForm.PedagogicalStrategies.join(', ')
          : tematicaForm.PedagogicalStrategies || "",
        coverage: Array.isArray(tematicaForm.Coverage)
          ? tematicaForm.Coverage.join(', ')
          : tematicaForm.Coverage || "",
      },
    ];

    const jwtToken = getToken();
    const parseJwt = (t: string) => {
      try {
        const parts = t.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(
          atob(payload)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    };

    const tryExtractUserId = (t?: string | null) => {
      if (!t) return null;
      const parsed = parseJwt(t);
      if (!parsed || typeof parsed !== 'object') return null;
      const candidates = [
        'sub',
        'id',
        'userId',
        'user_id',
        'nameid',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
      ];
      for (const k of candidates) {
        const v = (parsed as any)[k];
        if (v !== undefined && v !== null) {
          const num = Number(v);
          if (!Number.isNaN(num) && Number.isFinite(num) && num > 0) return Math.trunc(num);
        }
      }
      return null;
    };

    const extractedUserId = tryExtractUserId(jwtToken);

    const stateCandidate =
      identificacionInstitucional?.stateExperienceId ??
      identificacionForm?.stateExperienceId ??
      identificacionForm?.estado ??
      identificacionInstitucional?.estado;

    const parseStateId = (v: any): number | null => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.trunc(v);
      if (typeof v === 'string') {
        const n = Number(v);
        if (!Number.isNaN(n) && Number.isFinite(n) && n > 0) return Math.trunc(n);
      }
      return null;
    };
    const finalStateId = parseStateId(stateCandidate);

    const payload: any = {
      nameExperiences: identificacionForm?.nameExperience || identificacionInstitucional.nameExperiences || identificacionInstitucional.name || "",
      code: identificacionForm?.code || identificacionInstitucional?.code || identificacionInstitucional?.codeDane || formData.code || "",
      thematicLocation: tematicaForm.thematicLocation || "",
      ...(tiempo && tiempo.developmenttime ? { developmenttime: tiempo.developmenttime } : {}),
      recognition: tematicaForm?.recognitionText || tematicaForm?.recognition || tiempo.recognition || "",
      socialization: Array.isArray(tematicaForm?.socialization)
        ? tematicaForm.socialization.join(', ')
        : Array.isArray(tematicaForm?.socializationLabels)
          ? tematicaForm.socializationLabels.join(', ')
          : (typeof tematicaForm?.socialization === 'string'
            ? tematicaForm.socialization
            : (typeof tematicaForm?.socializationLabels === 'string'
              ? tematicaForm?.socializationLabels
              : (tiempo.socialization || ""))),
      socializationLabels: Array.isArray(tematicaForm?.socialization)
        ? tematicaForm.socialization
        : Array.isArray(tematicaForm?.socializationLabels)
          ? tematicaForm.socializationLabels
          : undefined,
      pedagogicalStrategies: tematicaForm.PedagogicalStrategies || [],
      coverage: tematicaForm.Coverage || "",
      coverageText: tematicaForm.CoverageText || "",
      sustainability: informacionApoyo.sustainability || "",
      ...(finalStateId ? { stateExperienceId: finalStateId } : {}),
      institution: {
        name: identificacionInstitucional.name || "",
        address: identificacionInstitucional.address || "",
        phone: identificacionInstitucional.phone || 0,
        codeDane: identificacionInstitucional.codeDane || "",
        emailInstitucional: identificacionInstitucional.emailInstitucional || "",
        nameRector: identificacionInstitucional.nameRector || "",
        caracteristic: identificacionInstitucional.caracteristic || "",
        territorialEntity: identificacionInstitucional.territorialEntity || "",
        testsKnow: identificacionInstitucional.testsKnow || "",
        addresses: (() => {
          const src = identificacionInstitucional.addresses ?? (identificacionInstitucional.address ? [identificacionInstitucional.address] : []);
          if (!Array.isArray(src) || src.length === 0) return [];
          return src.map((a: any) => {
            if (!a) return null;
            if (typeof a === 'string') {
              return {
                address: a,
                municipality: identificacionInstitucional.municipality || undefined,
                departament: identificacionInstitucional.departament || undefined,
                commune: identificacionInstitucional.communes || undefined,
                eZone: identificacionInstitucional.eZone || undefined,
              };
            }
            return {
              address: a.address || a.addressLine || a.street || identificacionInstitucional.address || "",
              municipality: a.municipality || a.city || identificacionInstitucional.municipality || undefined,
              departament: a.departament || a.department || identificacionInstitucional.departament || undefined,
              commune: a.commune || a.communeName || identificacionInstitucional.communes || undefined,
              eZone: a.eZone || a.zone || identificacionInstitucional.eZone || undefined,
            };
          }).filter((x: any) => x !== null);
        })(),
        communes: Array.isArray(identificacionInstitucional.communes)
          ? identificacionInstitucional.communes.map((c: any) => (typeof c === 'string' ? { name: c } : c))
          : identificacionInstitucional.communes
            ? [{ name: identificacionInstitucional.communes }]
            : [],
        departamentes: identificacionInstitucional.departament
          ? [{ name: identificacionInstitucional.departament }]
          : Array.isArray(identificacionInstitucional.departamentes)
            ? identificacionInstitucional.departamentes.map((d: any) => (typeof d === 'string' ? { name: d } : d))
            : [],
        eeZones: identificacionInstitucional.eZone
          ? [{ name: identificacionInstitucional.eZone }]
          : Array.isArray(identificacionInstitucional.eeZones)
            ? identificacionInstitucional.eeZones.map((z: any) => (typeof z === 'string' ? { name: z } : z))
            : [],
        municipalities: identificacionInstitucional.municipality
          ? [{ name: identificacionInstitucional.municipality }]
          : Array.isArray(identificacionInstitucional.municipalities)
            ? identificacionInstitucional.municipalities.map((m: any) => (typeof m === 'string' ? { name: m } : m))
            : [],
      },
      documents: documentsSwagger,
      objectives: objectivesSwagger,
      leaders: leadersSwagger,
      developments: developmentsSwagger,
      historyExperiences: historyExperiences,
      populationGradeIds: numericPopulationGradeIds,
      populationGrades: stringPopulationGrades.length ? stringPopulationGrades : undefined,
      thematicLineIds: formData.thematicLineIds?.length ? formData.thematicLineIds : tematicaForm.thematicLineIds || [],
      grades: (grades && grades.length > 0)
        ? grades
        : Array.isArray(tematicaForm?.grades)
          ? tematicaForm.grades.map((g: any) => (typeof g === 'string' ? { gradeId: 0, description: g } : g))
          : Array.isArray(tematicaForm?.gradeId)
            ? tematicaForm.gradeId.map((g: any) => (typeof g === 'string' ? { gradeId: 0, description: g } : g))
            : [],
    };

    const normalizeOrRemoveUserId = (obj: any, userIdValue: number | null) => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach((k) => {
        try {
          const v = obj[k];
          if (k === 'userId') {
            if (userIdValue && Number.isFinite(userIdValue) && userIdValue > 0) {
              obj[k] = userIdValue;
            } else {
              delete obj[k];
            }
            return;
          }
          if (Array.isArray(v)) {
            v.forEach((item) => normalizeOrRemoveUserId(item, userIdValue));
          } else if (typeof v === 'object') {
            normalizeOrRemoveUserId(v, userIdValue);
          }
        } catch { }
      });
    };

    const storedUserId = Number(localStorage.getItem('userId')) || null;
    const finalUserId = extractedUserId ?? (storedUserId && Number.isFinite(storedUserId) && storedUserId > 0 ? storedUserId : null);
    if (finalUserId) {
      payload.userId = finalUserId;
    }
    normalizeOrRemoveUserId(payload, finalUserId ?? null);

    console.log("Objeto enviado al backend (CREATE):", JSON.stringify(payload, null, 2));

    try {
      setErrorMessage("");
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
      const endpoint = `${API_BASE}/api/Experience/register`;

      const authToken = jwtToken ?? localStorage.getItem("token");
      let res: Response | null = null;
      const doFetch = async (url: string) =>
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });

      try {
        res = await doFetch(endpoint);
      } catch (networkErr: any) {
        console.warn("Network error when calling Experience/register:", networkErr);
        try {
          const u = new URL(endpoint);
          if ((u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.protocol === 'https:') {
            const fallback = `http:${u.href.substring(u.origin.length)}`;
            console.info(`Retrying Experience/register using HTTP fallback: ${fallback}`);
            res = await doFetch(fallback);
          } else {
            throw networkErr;
          }
        } catch (innerErr) {
          console.error('Fallback attempt failed:', innerErr);
          throw networkErr;
        }
      }

      if (!res.ok) {
        let errorText = `Error al registrar la experiencia (HTTP ${res.status})`;
        let backendMsg = "";
        try {
          const errorData = await res.clone().json();
          if (errorData?.errors) {
            backendMsg = JSON.stringify(errorData.errors);
            try {
              const fieldErrs: Record<string, string> = {};
              Object.entries(errorData.errors).forEach(([k, v]) => {
                fieldErrs[k] = Array.isArray(v) ? (v as any[]).join(" ") : String(v);
              });
              setFieldErrors(fieldErrs);
            } catch { }
          } else {
            backendMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
          }
        } catch {
          try {
            backendMsg = await res.clone().text();
          } catch { }
        }
        if (backendMsg && backendMsg !== "") {
          errorText += `: ${backendMsg}`;
        }
        setErrorMessage(errorText);
        try {
          Swal.fire({ title: 'Error', text: backendMsg || errorText, icon: 'error', confirmButtonText: 'Aceptar' });
        } catch { }
        console.error("Payload enviado:", payload);
        return;
      }

      let created: any = null;
      try {
        created = await res.clone().json();
      } catch { }

      const extractIdFromLocation = (loc: string | null) => {
        if (!loc) return null;
        const m = loc.match(/\/(\d+)(?:\/|$)/);
        return m ? Number(m[1]) : null;
      };

      let createdId: number | null = null;
      const tryCoerceId = (value: unknown): number | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
        if (typeof value === 'string' && value.trim() !== '') {
          const coerced = Number(value);
          return Number.isFinite(coerced) && coerced > 0 ? coerced : null;
        }
        return null;
      };

      const findIdDeep = (source: unknown, depth = 0): number | null => {
        if (depth > 5 || source === null || source === undefined) return null;
        const direct = tryCoerceId(source);
        if (direct) return direct;

        if (Array.isArray(source)) {
          for (const item of source) {
            const found = findIdDeep(item, depth + 1);
            if (found) return found;
          }
          return null;
        }

        if (typeof source === 'object') {
          const obj = source as Record<string, unknown>;
          const preferredKeys = ['experienceId', 'ExperienceId', 'id', 'Id', 'result'];
          for (const key of preferredKeys) {
            if (key in obj) {
              const found = findIdDeep(obj[key], depth + 1);
              if (found) return found;
            }
          }
          for (const value of Object.values(obj)) {
            const found = findIdDeep(value, depth + 1);
            if (found) return found;
          }
        }
        return null;
      };

      if (created) {
        createdId = findIdDeep(created);
      }

      if (!createdId) {
        const loc = res.headers.get('Location');
        createdId = extractIdFromLocation(loc);
      }

      if (!createdId) {
        const location = res.headers.get('Location');
        if (location) {
          try {
            const parsed = new URL(location, window.location.origin);
            const fromQuery = parsed.searchParams.get('experienceId') || parsed.searchParams.get('id') || parsed.searchParams.get('experience');
            createdId = tryCoerceId(fromQuery);
          } catch { }
        }
      }

      if (!createdId) {
        console.warn('Experience created but id could not be determined; notification may not be sent');
      }

      if (createdId && Number.isFinite(createdId) && createdId > 0) {
        const pdfEndpoint = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/Experience/${createdId}/generate-pdf`;
        try {
          const pdfRes = await fetch(pdfEndpoint, {
            method: 'GET',
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          });
          if (pdfRes.ok) {
            const blob = await pdfRes.blob();
            const url = URL.createObjectURL(blob);
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          } else {
            console.warn('Fallo al generar PDF:', await pdfRes.text().catch(() => ''));
            try {
              await Swal.fire({ title: 'Éxito', text: 'Experiencia registrada. Falló la generación del PDF.', icon: 'warning', confirmButtonText: 'Aceptar' });
            } catch { }
            if (onVolver) onVolver();
            return;
          }
        } catch (pdfErr) {
          console.error('Error al descargar PDF:', pdfErr);
          try {
            await Swal.fire({ title: 'Éxito', text: 'Experiencia registrada. No se pudo obtener el PDF.', icon: 'warning', confirmButtonText: 'Aceptar' });
          } catch { }
          if (onVolver) onVolver();
          return;
        }
      }

      try {
        // Pausar notificaciones SignalR
        localStorage.setItem('pauseSignalRNotification', '1');
        await Swal.fire({ title: 'Éxito', text: 'Experiencia registrada correctamente', icon: 'success', confirmButtonText: 'Aceptar' });
      } catch { }
      // Quitar pausa y permitir mostrar la notificación
      localStorage.removeItem('pauseSignalRNotification');
      if (onVolver) onVolver();
    } catch (err: any) {
      const msg = err?.message || "Error inesperado al registrar la experiencia";
      setErrorMessage(msg);
      try {
        Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonText: 'Aceptar' });
      } catch { }
    }
  };

  // Define canEdit: allow editing if not readOnly
  const canEdit = !readOnly;

  return (
    <div className="p-6 bg-white rounded-lg shadow max-h-[95vh] overflow-y-auto max-w-7xl mx-auto">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {showBackButton && (
        <button onClick={onVolver} className="mb-4 text-sky-600 hover:underline">
          ← Volver
        </button>
      )}

      <div>
        {/* Stepper header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-center mb-3">Registro de Experiencia</h2>
          <div className="w-full overflow-x-auto py-4">
            <div className="relative w-full px-4">
              <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200" />
              <div className="flex items-start justify-between">
                {steps.map((label, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center text-center min-w-[90px]">
                      <div
                        className={`z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted
                          ? "bg-sky-500 text-white"
                          : isActive
                            ? "bg-pink-300 text-white border-2 border-pink-200"
                            : "bg-white border border-gray-200 text-gray-500"
                          }`}
                      >
                        {idx + 1}
                      </div>
                      <div className={`mt-2 text-xs ${isActive ? "text-pink-600 font-medium" : "text-gray-500"}`}>
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            {/* Sección 0: Institucional */}
            {currentStep === 0 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(0)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <InstitutionalIdentification
                  value={identificacionInstitucional}
                  onChange={setIdentificacionInstitucional}
                  errors={fieldErrors}
                  {...(typeof readOnly !== 'undefined' && { readOnly: readOnly && editSection !== 0 })}
                />
                {editSection === 0 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchInstitutional}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 1: Líder */}
            {currentStep === 1 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(1)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <LeadersForm value={lideres} onChange={setLideres} index={0} />
                {editSection === 1 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchLeaders}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 2: Identificación Experiencia */}
            {currentStep === 2 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(2)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <IdentificationForm value={identificacionForm} onChange={setIdentificacionForm} />
                {editSection === 2 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchIdentification}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 3: Temática y Desarrollo */}
            {currentStep === 3 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(3)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <ThematicForm value={tematicaForm} onChange={setTematicaForm} />
                {editSection === 3 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchThematic}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 4: Componentes (Objetivos) */}
            {currentStep === 4 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(4)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <Components value={objectiveExperience} onChange={setObjectiveExperience} />
                {editSection === 4 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchComponents}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 5: Monitoreos / Seguimiento */}
            {currentStep === 5 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(5)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <FollowUpEvaluation value={seguimientoEvaluacion} onChange={setSeguimientoEvaluacion} />
                {editSection === 5 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchFollowUp}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 6: Testimonios / Soportes */}
            {currentStep === 6 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                      onClick={() => setEditSection(6)}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <SupportInformationForm value={informacionApoyo} onChange={setInformacionApoyo} />
                {editSection === 6 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchSupportInfo}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* Sección 7: Documentos */}
            {currentStep === 7 && (
              <FormSection>
                <div className="flex justify-end mb-2 gap-2">
                  {readOnly && (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                        onClick={() => setEditSection(7)}
                      >
                        Editar
                      </button>
                      {initialData && initialData.id && (
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 ml-2"
                          onClick={async () => {
                            try {
                              const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
                              const token = localStorage.getItem('token');
                              const pdfEndpoint = `${API_BASE}/api/Experience/${initialData.id}/generate-pdf`;
                              const res = await fetch(pdfEndpoint, {
                                method: 'GET',
                                headers: {
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                              });
                              if (res.ok) {
                                // Intentar extraer mensaje y url del backend
                                let backendMsg = 'PDF generado correctamente';
                                let pdfUrl = '';
                                try {
                                  const contentType = res.headers.get('Content-Type') || '';
                                  if (contentType.includes('application/json')) {
                                    const data = await res.clone().json();
                                    if (data && data.message) backendMsg = data.message;
                                    if (data && data.pdfUrl) pdfUrl = data.pdfUrl;
                                  }
                                } catch {}
                                // Si no hay pdfUrl, usar el blob como fallback
                                if (!pdfUrl) {
                                  const blob = await res.blob();
                                  pdfUrl = URL.createObjectURL(blob);
                                }
                                // Mostrar modal personalizado
                                const modal = document.createElement('div');
                                modal.style.position = 'fixed';
                                modal.style.top = '0';
                                modal.style.left = '0';
                                modal.style.width = '100vw';
                                modal.style.height = '100vh';
                                modal.style.background = 'rgba(0,0,0,0.4)';
                                modal.style.zIndex = '9999';
                                modal.style.display = 'flex';
                                modal.style.alignItems = 'center';
                                modal.style.justifyContent = 'center';
                                modal.innerHTML = `
                                  <div style="background: white; padding: 2rem 2.5rem; border-radius: 1rem; box-shadow: 0 2px 24px #0002; max-width: 95vw; text-align: center;">
                                    <h2 style="font-size: 1.3rem; font-weight: bold; margin-bottom: 1rem;">${backendMsg}</h2>
                                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                                      <a id="abrir-pdf-btn" href="${pdfUrl}" target="_blank" rel="noopener noreferrer" style="background: #dc2626; color: white; padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; text-decoration: none; display: inline-block;">Abrir PDF</a>
                                      <button id="cerrar-modal-btn" style="background: #374151; color: white; padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: none; font-weight: 600; font-size: 1rem; cursor: pointer;">Cerrar</button>
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                                // Cerrar modal y pestaña
                                modal.querySelector('#cerrar-modal-btn')?.addEventListener('click', () => {
                                  document.body.removeChild(modal);
                                  window.close();
                                });
                                // Si se usó blob, liberar url después de 1 min
                                if (pdfUrl.startsWith('blob:')) {
                                  setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
                                }
                              } else {
                                const msg = await res.text().catch(() => '');
                                alert('No se pudo generar el PDF. ' + msg);
                              }
                            } catch (err) {
                              alert('Error al generar el PDF.');
                            }
                          }}
                        >
                          Generar PDF
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="my-6">
                  <PDFUploader value={pdfFile} onChange={setPdfFile} />
                  {pdfFile && (
                    <div className="mt-2 text-center">
                      <span className="font-semibold">PDF seleccionado:</span> {pdfFile.name}
                    </div>
                  )}
                </div>
                {editSection === 7 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      onClick={() => setEditSection(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handlePatchDocuments}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </FormSection>
            )}
          </div>

          <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-3 flex justify-between items-center mt-6">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={prevStep}
              className={`px-4 py-2 rounded ${currentStep === 0
                ? "bg-slate-200 text-slate-400"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
            >
              Atrás
            </button>

            {!isLastStep() ? (
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentStep()) nextStep();
                }}
                disabled={!isCurrentStepValidSync()}
                className={`px-4 py-2 rounded ${!isCurrentStepValidSync()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600"
                  }`}
              >
                Siguiente
              </button>
            ) : (
              readOnly ? (
                <button
                  type="button"
                  onClick={() => { if (onVolver) onVolver(); }}
                  className="px-4 py-2 rounded bg-white border"
                >
                  Cerrar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!isCurrentStepValidSync()}
                  className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                    !isCurrentStepValidSync()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : "bg-sky-600 text-white hover:bg-sky-700"
                  }`}
                >
                  Guardar Experiencia
                </button>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExperience;
