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
  <div className="nb-page flex items-center justify-center">
    <div className="nb-card p-6 sm:p-8 flex flex-col items-center gap-3">
      <div className="w-11 h-11 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
        Carregando
      </p>
    </div>
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
          <div className="relative min-h-screen overflow-x-hidden text-slate-900 dark:text-blue-50">
            <div className="pointer-events-none fixed inset-0 opacity-35">
              <WindSense />
            </div>

            <div className="nb-glow h-[24rem] w-[24rem] -top-24 -left-24 bg-brand-accent/20" />
            <div className="nb-glow h-[26rem] w-[26rem] top-[38%] -right-24 bg-brand-primary/20" />

            <FloatingSettings />

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