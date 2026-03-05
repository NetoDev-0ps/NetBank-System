import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../core/api/apiClient";
import { getCustomerData, logout } from "../../core/auth/session";
import T from "../../shared/ui/Translate";
import {
  extractPixApiError,
  generateTransferIdempotencyKey,
  normalizePixKey,
  safeParseArray,
} from "./pix/pixUtils";
import { PixFatalState, PixFlowContent, PixLoadingState } from "./pix/PixFlowContent";

function PixAreaPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [usuario, setUsuario] = useState(() => getCustomerData());

  const [etapa, setEtapa] = useState("CARREGANDO");
  const [subEtapa, setSubEtapa] = useState("DIGITAR");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [senhaSetup, setSenhaSetup] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [chaveDestino, setChaveDestino] = useState("");
  const [dadosDestino, setDadosDestino] = useState(null);
  const [valorTransferencia, setValorTransferencia] = useState("");
  const [senhaValidacao, setSenhaValidacao] = useState("");
  const [comprovante, setComprovante] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [chaveParaExcluir, setChaveParaExcluir] = useState(null);

  const favsKey = `@netbank_favs_${usuario?.id || "guest"}`;
  const recsKey = `@netbank_recs_${usuario?.id || "guest"}`;

  const [favoritos, setFavoritos] = useState(() => safeParseArray(sessionStorage, favsKey));
  const [recentes, setRecentes] = useState(() => safeParseArray(sessionStorage, recsKey));
  const [minhasChaves, setMinhasChaves] = useState([]);
  const userId = usuario?.id;

  useEffect(() => {
    if (!userId) {
      logout("/login-cliente");
      return;
    }

    const verificarSeguranca = async () => {
      setErro("");
      setEtapa("CARREGANDO");

      try {
        const statusResponse = await api.get(`/pix/status/${userId}`);
        const { temSenha, temChaves } = statusResponse.data;

        if (!temSenha) {
          setEtapa("SENHA_SETUP");
          return;
        }

        const keysResponse = await api.get(`/pix/chaves/${userId}`);
        setMinhasChaves(keysResponse.data);

        if (!temChaves) {
          setEtapa("CHAVE_SETUP");
          return;
        }

        setEtapa("HUB");
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Erro fatal de sincronizacao:", error);
        }

        setErro(extractPixApiError(error, "Falha ao carregar seguranca."));
        setEtapa("ERRO_FATAL");
      }
    };

    verificarSeguranca();
  }, [userId]);

  useEffect(() => {
    if (etapa === "SENHA_SETUP" || etapa === "TRANSFERIR_SENHA") {
      inputRef.current?.focus();
    }
  }, [etapa, subEtapa]);

  const handleVoltar = () => {
    if (
      etapa === "SENHA_SETUP" ||
      etapa === "CHAVE_SETUP" ||
      etapa === "CARREGANDO" ||
      etapa === "ERRO_FATAL"
    ) {
      navigate("/dashboard");
      return;
    }

    if (etapa === "HUB" || etapa === "SUCESSO") {
      navigate("/dashboard");
      return;
    }

    if (etapa === "TRANSFERIR_SENHA") {
      setEtapa("TRANSFERIR_VALOR");
      return;
    }

    if (etapa === "TRANSFERIR_VALOR") {
      setEtapa("TRANSFERIR_CHAVE");
      return;
    }

    if (etapa === "TRANSFERIR_CHAVE" || etapa === "GERENCIAR_CHAVES") {
      setChaveDestino("");
      setErro("");
      setIdempotencyKey("");
      setEtapa("HUB");
    }
  };

  const resetSetup = () => {
    setSenhaSetup("");
    setConfirmacaoSenha("");
    setSubEtapa("DIGITAR");
    setErro("");
  };

  const finalizarSetupSenha = async () => {
    setLoading(true);

    try {
      await api.post("/pix/configurar-senha", {
        usuarioId: usuario.id,
        senha: confirmacaoSenha,
      });

      setErro("");
      setEtapa("CHAVE_SETUP");
    } catch (error) {
      setErro(extractPixApiError(error, "Erro ao salvar senha Pix."));
      resetSetup();
    } finally {
      setLoading(false);
    }
  };

  const handleAtivarChave = async (tipoChave, valorChave) => {
    setLoading(true);
    setErro("");

    try {
      const valorLimpo =
        tipoChave === "EMAIL" ? valorChave.trim() : String(valorChave).replace(/\D/g, "");

      await api.post("/pix/registrar-chave", {
        usuarioId: usuario.id,
        tipo: tipoChave,
        valor: valorLimpo,
      });

      if (etapa === "GERENCIAR_CHAVES") {
        await carregarMinhasChaves();
      } else {
        setEtapa("HUB");
      }
    } catch (error) {
      setErro(extractPixApiError(error, "Erro ao registrar chave Pix."));
    } finally {
      setLoading(false);
    }
  };

  const carregarMinhasChaves = async () => {
    setLoading(true);
    setErro("");

    try {
      const response = await api.get(`/pix/chaves/${userId}`);
      setMinhasChaves(response.data);

      if (etapa !== "CHAVE_SETUP") {
        setEtapa("GERENCIAR_CHAVES");
      }
    } catch (error) {
      setErro(extractPixApiError(error, "Erro ao carregar chaves Pix."));
    } finally {
      setLoading(false);
    }
  };

  const abrirModalExclusao = (chaveId) => {
    setChaveParaExcluir(chaveId);
  };

  const confirmarExclusao = async () => {
    setLoading(true);

    try {
      await api.delete(`/pix/chaves/${chaveParaExcluir}?usuarioId=${usuario.id}`);
      setChaveParaExcluir(null);
      await carregarMinhasChaves();
    } catch (error) {
      setErro(extractPixApiError(error, "Erro ao excluir chave Pix."));
    } finally {
      setLoading(false);
    }
  };

  const buscarDestinatario = async (chaveDireta = null) => {
    const chaveBruta = chaveDireta || chaveDestino;
    const chaveLimpa = normalizePixKey(chaveBruta);

    if (!chaveLimpa) {
      setErro("Insira uma chave valida.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await api.get(`/pix/preview/${chaveLimpa}`);
      setDadosDestino({ ...response.data, chaveUsada: chaveLimpa });
      setChaveDestino(chaveLimpa);
      setEtapa("TRANSFERIR_VALOR");
    } catch (error) {
      setErro(extractPixApiError(error, "Chave nao encontrada no sistema."));
    } finally {
      setLoading(false);
    }
  };

  const realizarTransferencia = async () => {
    const transferKey = idempotencyKey || generateTransferIdempotencyKey();

    if (!idempotencyKey) {
      setIdempotencyKey(transferKey);
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/pix/transferir",
        {
          idOrigem: usuario.id,
          idDestino: dadosDestino.idDestino,
          valor: valorTransferencia,
          senha: senhaValidacao,
        },
        {
          headers: {
            "Idempotency-Key": transferKey,
          },
        },
      );

      setComprovante(response.data);

      const novoRecente = {
        nome: dadosDestino.nome,
        chave: dadosDestino.chaveUsada,
        cpfMascarado: dadosDestino.cpfMascarado,
      };
      const recs = [novoRecente, ...recentes.filter((item) => item.chave !== novoRecente.chave)].slice(0, 5);
      setRecentes(recs);
      sessionStorage.setItem(recsKey, JSON.stringify(recs));

      setEtapa("SUCESSO");
    } catch (error) {
      setErro(extractPixApiError(error, "Nao foi possivel concluir a transferencia."));
      setSenhaValidacao("");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = (contato) => {
    const isFav = favoritos.some((item) => item.chave === contato.chave);
    const novosFavs = isFav
      ? favoritos.filter((item) => item.chave !== contato.chave)
      : [...favoritos, contato];

    setFavoritos(novosFavs);
    sessionStorage.setItem(favsKey, JSON.stringify(novosFavs));
  };

  const tiposCadastrados = minhasChaves.map((chave) => chave.tipo);

  if (etapa === "CARREGANDO") {
    return <PixLoadingState />;
  }

  if (etapa === "ERRO_FATAL") {
    return (
      <PixFatalState
        error={erro}
        onBack={() => {
          setIdempotencyKey("");
          navigate("/dashboard");
        }}
        onRetry={() => setUsuario(getCustomerData())}
      />
    );
  }

  return (
    <div
      className="min-h-screen p-6 font-sans text-slate-900 dark:text-white bg-netlight-50 dark:bg-slate-950"
      onClick={() => inputRef.current?.focus()}
    >
      <header className="flex items-center justify-between max-w-md mx-auto mb-10">
        <button
          onClick={handleVoltar}
          className="p-3 text-blue-400 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary dark:text-blue-100">
          <T>Area Pix</T>
        </h1>
        <div className="w-12" />
      </header>

      <main className="relative max-w-md mx-auto">
        <PixFlowContent
          etapa={etapa}
          subEtapa={subEtapa}
          erro={erro}
          loading={loading}
          inputRef={inputRef}
          senhaSetup={senhaSetup}
          confirmacaoSenha={confirmacaoSenha}
          setSenhaSetup={setSenhaSetup}
          setConfirmacaoSenha={setConfirmacaoSenha}
          setSubEtapa={setSubEtapa}
          finalizarSetupSenha={finalizarSetupSenha}
          resetSetup={resetSetup}
          handleAtivarChave={handleAtivarChave}
          usuario={usuario}
          minhasChaves={minhasChaves}
          tiposCadastrados={tiposCadastrados}
          carregarMinhasChaves={carregarMinhasChaves}
          abrirModalExclusao={abrirModalExclusao}
          chaveParaExcluir={chaveParaExcluir}
          setChaveParaExcluir={setChaveParaExcluir}
          confirmarExclusao={confirmarExclusao}
          chaveDestino={chaveDestino}
          setChaveDestino={setChaveDestino}
          buscarDestinatario={buscarDestinatario}
          favoritos={favoritos}
          recentes={recentes}
          toggleFavorito={toggleFavorito}
          dadosDestino={dadosDestino}
          valorTransferencia={valorTransferencia}
          setValorTransferencia={setValorTransferencia}
          setEtapa={setEtapa}
          setErro={setErro}
          idempotencyKey={idempotencyKey}
          setIdempotencyKey={setIdempotencyKey}
          senhaValidacao={senhaValidacao}
          setSenhaValidacao={setSenhaValidacao}
          realizarTransferencia={realizarTransferencia}
          comprovante={comprovante}
          onFinish={() => {
            setIdempotencyKey("");
            navigate("/dashboard");
          }}
        />
      </main>
    </div>
  );
}

export default PixAreaPage;