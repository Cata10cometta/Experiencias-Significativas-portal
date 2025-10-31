// src/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardTeacher from "./pages/DashboardTeacher";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute role="admin"><DashboardAdmin /></ProtectedRoute>} />
      <Route path="/dashboardTeacher" element={<ProtectedRoute role="teacher"><DashboardTeacher /></ProtectedRoute>} />
    </Routes>


  </BrowserRouter>
);

export default AppRoutes;
