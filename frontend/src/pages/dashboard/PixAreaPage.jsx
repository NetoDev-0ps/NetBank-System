import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../core/api/apiClient";
import { getCustomerData, logout } from "../../core/auth/session";
import T from "../../shared/ui/Translate";
import {
  detectPixKeyType,
  extractPixApiError,
  formatarPeloTipo,
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
          console.error("Erro fatal de sincroniza\u00e7\u00e3o:", error);
        }

        setErro(extractPixApiError(error, "Falha ao carregar seguran\u00e7a Pix."));
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
      setErro("Insira uma chave v\u00e1lida.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await api.get(`/pix/preview/${chaveLimpa}`);
      const preview = response.data || {};

      if (Number(preview.idDestino) === Number(usuario?.id)) {
        setErro("N\u00e3o \u00e9 permitido transferir para sua pr\u00f3pria conta.");
        return;
      }

      const tipoChave = preview.chaveTipo || detectPixKeyType(chaveLimpa);
      const chaveFormatada =
        tipoChave === "EMAIL" ? chaveLimpa : formatarPeloTipo(chaveLimpa, tipoChave);

      setDadosDestino({
        ...preview,
        chaveUsada: chaveLimpa,
        chaveTipo: tipoChave,
      });
      setChaveDestino(chaveFormatada || chaveLimpa);
      setEtapa("TRANSFERIR_VALOR");
    } catch (error) {
      setErro(extractPixApiError(error, "Chave n\u00e3o encontrada no sistema."));
    } finally {
      setLoading(false);
    }
  };

  const realizarTransferencia = async () => {
    const valorNumerico = Number.parseFloat(String(valorTransferencia).replace(",", "."));

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    if (Number(dadosDestino?.idDestino) === Number(usuario?.id)) {
      setErro("N\u00e3o \u00e9 permitido transferir para sua pr\u00f3pria conta.");
      return;
    }

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
          valor: Number(valorNumerico.toFixed(2)),
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
        chaveTipo: dadosDestino.chaveTipo,
        cpfMascarado: dadosDestino.cpfMascarado,
      };
      const recs = [novoRecente, ...recentes.filter((item) => item.chave !== novoRecente.chave)].slice(0, 5);
      setRecentes(recs);
      sessionStorage.setItem(recsKey, JSON.stringify(recs));

      setEtapa("SUCESSO");
    } catch (error) {
      setErro(extractPixApiError(error, "N\u00e3o foi poss\u00edvel concluir a transfer\u00eancia."));
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
    <div className="nb-page py-6 sm:py-8" onClick={() => inputRef.current?.focus()}>
      <header className="nb-shell mb-6 flex items-center justify-between">
        <button type="button" onClick={handleVoltar} className="nb-button-ghost !p-2.5" aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <p className="nb-eyebrow"><T>Conta digital</T></p>
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
            <T>{"\u00c1rea Pix NetBank"}</T>
          </h1>
        </div>

        <div className="h-10 w-10" aria-hidden="true" />
      </header>

      <main className="nb-shell max-w-3xl">
        <section className="nb-card p-4 sm:p-6 md:p-8">
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
        </section>
      </main>
    </div>
  );
}

export default PixAreaPage;
