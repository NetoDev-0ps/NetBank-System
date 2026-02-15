import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

// Importações Globais (Caminhos Modulares)
import ThemeToggle from "./shared/ui/ThemeToggle";
import WindSense from "./shared/effects/WindFlowCanvas";

// Importações de Páginas
import HomePage from "./pages/home/HomePage";
import ManagerLogin from "./pages/auth/ManagerLogin";
import CustomerLoginPage from "./pages/auth/CustomerLoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
import ManagerDashboardPage from "./pages/dashboard/ManagerDashboardPage";
import CustomerDashboardPage from "./pages/dashboard/CustomerDashboardPage";
import PixAreaPage from "./pages/dashboard/PixAreaPage";

const RotaGerente = ({ children }) => {
  const token = localStorage.getItem("token");
  const cargo = localStorage.getItem("usuario-cargo");
  const isAutenticado = token === "logado-como-gerente" && (cargo === "GERENTE" || cargo === "ADMIN");
  return isAutenticado ? children : <Navigate to="/login-gerente" replace />;
};

RotaGerente.propTypes = { children: PropTypes.node.isRequired };

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen transition-colors duration-500">
      <ThemeToggle />
      <WindSense />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login-gerente" element={<ManagerLogin />} />
          <Route path="/login-cliente" element={<CustomerLoginPage />} />
          <Route path="/cadastro-cliente" element={<RegistrationPage />} />
          <Route path="/painel" element={<RotaGerente><ManagerDashboardPage /></RotaGerente>} />
          <Route path="/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/area-pix" element={<PixAreaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;