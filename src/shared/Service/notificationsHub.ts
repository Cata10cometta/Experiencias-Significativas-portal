import * as signalR from "@microsoft/signalr";
import { getToken } from "../../Api/Services/Auth";

// Usar la misma base URL que Config.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

let connection: signalR.HubConnection | null = null;

export const startNotificationHub = (onMessage: (msg: any) => void) => {
  if (connection) return connection; // evitar conexiones múltiples

  const token = getToken();

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/hubs/notifications`, {
      // Usar SkipNegotiation y WebSockets directamente para evitar problemas de CORS
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
      accessTokenFactory: () => token || "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Evento que llega desde el backend
  connection.on("ReceiveNotification", (message) => {
    console.log("📩 Notificación en tiempo real:", message);
    onMessage(message);
  });

  // Inicializar la conexión
  connection
    .start()
    .then(() => console.log("🔌 Connected to NotificationHub"))
    .catch((err) => console.error("❌ Error connecting to hub:", err));

  return connection;
};

export const stopNotificationHub = () => {
  if (connection) {
    connection.stop();
    connection = null;
  }
};
