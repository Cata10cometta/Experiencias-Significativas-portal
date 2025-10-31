export interface person {
    FirstName: string,
    MiddleName: string,
    FirstLastName: string,
    SecondLastName: string,
    DocumentType: number,
    IdentificationNumber: string,
    CodeDane: string,
    Username: string,
    Email: string,
    EmailInstitutional: string,
    Phone: number,
    Password: string,
}


export interface user {
  id: number;         // siempre se envía 0 en el registro
  code: string;       // puedes generar un código, ej: "USR-123"
  username: string;   // ojo: minúscula según contrato
  password: string;
  personId: number;   // obligatorio, lo asignas del response de persona
  person: string;     // lo puedes mandar vacío ""
}


