import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

// --- ÁREA DE IMPORTS (O QUE FALTAVA) ---
// O React precisa saber onde estão esses arquivos para exibi-los
import Home from "./pages/Home";
import LoginGerente from "./pages/LoginGerente";
import LoginCliente from "./pages/LoginCliente";
import CadastroCliente from "./pages/CadastroCliente";
import Painel from "./pages/PainelGerente";
import ClientDashboard from "./pages/ClientDashboard";
import PixArea from "./pages/PixArea"; // Importante para o fluxo que acabamos de criar
// ----------------------------------------

// --- MANTER ESTE BLOCO ACIMA DA FUNCTION APP ---
const RotaGerente = ({ children }) => {
  const isLogado = localStorage.getItem("token") === "logado-como-gerente";
  return isLogado ? children : <Navigate to="/login-gerente" />;
};

const RotaCliente = ({ children }) => {
  const isLogado = localStorage.getItem("cliente_token") === "logado";
  return isLogado ? children : <Navigate to="/login-cliente" />;
};

// Validação de Props para o padrão Senior [cite: 2026-02-11]
RotaGerente.propTypes = {
  children: PropTypes.node.isRequired,
};

RotaCliente.propTypes = {
  children: PropTypes.node.isRequired,
};
// -----------------------------------------------

function App() {
  const location = useLocation(); // Captura a mudança de URL para animar a saída [cite: 2026-02-11]

  return (
    // O AnimatePresence gerencia a animação de SAÍDA das rotas
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login-gerente" element={<LoginGerente />} />
        <Route path="/login-cliente" element={<LoginCliente />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />

        {/* Rotas Protegidas (Gerente) */}
        <Route
          path="/painel"
          element={
            <RotaGerente>
              <Painel />
            </RotaGerente>
          }
        />

        {/* Rotas Protegidas (Cliente) */}
        <Route
          path="/dashboard"
          element={
            <RotaCliente>
              <ClientDashboard />
            </RotaCliente>
          }
        />
        <Route
          path="/pix"
          element={
            <RotaCliente>
              <PixArea />
            </RotaCliente>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
