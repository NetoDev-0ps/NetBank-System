import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

import { ThemeProvider } from "./core/contexts/ThemeProvider";
import { LanguageProvider } from "./core/contexts/LanguageProvider";
import { AuthProvider, useAuth } from "./core/contexts/AuthContext";

import FloatingSettings from "./shared/ui/FloatingSettings";
import WindSense from "./shared/effects/WindFlowCanvas";

const ProjectOverviewPage = lazy(() => import("./pages/showcase/ProjectOverviewPage"));
const HomePage = lazy(() => import("./pages/home/HomePage"));
const ManagerLogin = lazy(() => import("./pages/auth/ManagerLogin"));
const CustomerLoginPage = lazy(() => import("./pages/auth/CustomerLoginPage"));
const RegistrationPage = lazy(() => import("./pages/auth/RegistrationPage"));
const ManagerDashboardPage = lazy(() => import("./pages/dashboard/ManagerDashboardPage"));
const CustomerDashboardPage = lazy(() => import("./pages/dashboard/CustomerDashboardPage"));
const PixAreaPage = lazy(() => import("./pages/dashboard/PixAreaPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
  </div>
);

const RotaGerente = ({ children }) => {
  const { isManagerAuthenticated: ok, authResolved } = useAuth();

  if (!authResolved) {
    return <PageLoader />;
  }

  return ok ? children : <Navigate to="/login-gerente" replace />;
};
RotaGerente.propTypes = { children: PropTypes.node.isRequired };

const RotaCliente = ({ children }) => {
  const { isCustomerAuthenticated: ok, authResolved } = useAuth();

  if (!authResolved) {
    return <PageLoader />;
  }

  return ok ? children : <Navigate to="/login-cliente" replace />;
};
RotaCliente.propTypes = { children: PropTypes.node.isRequired };

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="w-full min-h-screen overflow-x-hidden transition-colors duration-500 bg-netlight-50 dark:bg-netdark-600 text-slate-900 dark:text-white">
            <FloatingSettings />
            <WindSense />

            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<ProjectOverviewPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/login-gerente" element={<ManagerLogin />} />
                  <Route path="/login-cliente" element={<CustomerLoginPage />} />
                  <Route path="/cadastro-cliente" element={<RegistrationPage />} />

                  <Route
                    path="/painel"
                    element={
                      <RotaGerente>
                        <ManagerDashboardPage />
                      </RotaGerente>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <RotaCliente>
                        <CustomerDashboardPage />
                      </RotaCliente>
                    }
                  />
                  <Route
                    path="/area-pix"
                    element={
                      <RotaCliente>
                        <PixAreaPage />
                      </RotaCliente>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;


