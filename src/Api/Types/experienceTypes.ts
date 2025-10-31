// DTOs para crear experiencia alineados al backend
export interface Institution {
  name: string;
  address: string;
  phone: number;
  codeDane: string;
  emailInstitucional: string;
  departament: string;
  commune: string;
  municipality: string;
  nameRector: string;
  eZone: string;
  caracteristic: string;
  territorialEntity: string;
  testsKnow: string;
}

export interface ExperienceDocument {
  name: string;
  urlPdf: string;
  urlLink: string;
}

export interface Grade {
  gradeId: number;
  description: string;
}

export interface Objective {
  descriptionProblem: string;
  objectiveExperience: string;
  enfoqueExperience: string;
  methodologias: string;
  innovationExperience: string;
  resulsExperience: string;
  sustainabilityExperience: string;
  tranfer: string;
  summary: string;
  metaphoricalPhrase: string;
  testimony: string;
  followEvaluation: string;
}

export interface HistoryExperience {
  action: string;
  tableName: string;
  userId: number;
  stateId: number;
}

export interface Experience {
  id: number;
  nameExperiences: string;
  code: string;
  nameFirstLeader: string;
  firstIdentityDocument: string;
  firdtEmail: string;
  firstPosition: string;
  firstPhone: number;
  nameSecondLeader: string;
  secondIdentityDocument: string;
  secondEmail: string;
  secondPosition: string;
  secondPhone: number;
  thematicLocation: string;
  stateId: number;
  thematicLineIds: number[];
  thematicLineNames?: string[]; // Nombres de las líneas temáticas (opcional, para autocompletar)
  coordinationTransversalProjects: string;
  population: string;
  pedagogicalStrategies: string;
  coverage: string;
  experiencesCovidPandemic: string;
  grades: Grade[];
  populationGradeIds: number[];
  developmenttime: string;
  recognition: string;
  socialization: string;
  userId: number;
  institution: Institution;
  documents: ExperienceDocument[]; // <- corregido aquí
  objectives: Objective[];
  historyExperiences: HistoryExperience[];
}

