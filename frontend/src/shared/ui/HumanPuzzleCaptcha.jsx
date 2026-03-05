import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import api from "../../core/api/apiClient";
import T from "./Translate";

const buildCaptchaErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "CAPTCHA_VERIFICACAO_FALHOU":
      return "Ajuste o encaixe e valide novamente.";
    case "CAPTCHA_CHALLENGE_REUTILIZADO":
      return "Desafio expirado. Solicite um novo desafio.";
    case "CAPTCHA_CHALLENGE_INVALIDO":
      return "Desafio invalido. Gere um novo desafio.";
    case "CAPTCHA_PROOF_INVALIDO":
      return "Falha de validacao humana. Tente novamente.";
    default:
      return "Nao foi possivel validar o desafio humano.";
  }
};

function HumanPuzzleCaptcha({ onVerified, disabled, refreshSignal }) {
  const [challenge, setChallenge] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const emitState = useCallback(
    (nextVerified, proofToken = "") => {
      onVerified({ verified: nextVerified, proofToken });
    },
    [onVerified],
  );

  const fetchChallenge = useCallback(async () => {
    setLoadingChallenge(true);
    setError("");
    setVerified(false);
    emitState(false, "");

    try {
      const response = await api.get("/auth/captcha/challenge", {
        meta: { skipAuthHandling: true },
      });

      const payload = response.data;
      const min = Number(payload?.min ?? 0);
      const max = Number(payload?.max ?? 100);
      const target = Number(payload?.target ?? 50);
      const tolerance = Number(payload?.tolerance ?? 4);
      const challengeToken = payload?.challengeToken || "";

      if (!challengeToken) {
        throw new Error("CAPTCHA_CHALLENGE_MALFORMADO");
      }

      setChallenge({ min, max, target, tolerance, challengeToken });
      setSliderValue(min);
    } catch {
      setChallenge(null);
      setError("Nao foi possivel iniciar a verificacao humana.");
    } finally {
      setLoadingChallenge(false);
    }
  }, [emitState]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge, refreshSignal]);

  const isInTarget = useMemo(() => {
    if (!challenge) {
      return false;
    }

    return Math.abs(sliderValue - challenge.target) <= challenge.tolerance;
  }, [challenge, sliderValue]);

  const validate = async () => {
    if (!challenge?.challengeToken) {
      setError("Desafio nao carregado. Atualize para continuar.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await api.post(
        "/auth/captcha/verify",
        {
          challengeToken: challenge.challengeToken,
          sliderValue,
        },
        {
          meta: { skipAuthHandling: true },
        },
      );

      const proofToken = response.data?.proofToken;
      if (!proofToken) {
        throw new Error("CAPTCHA_PROOF_INVALIDO");
      }

      setVerified(true);
      emitState(true, proofToken);
    } catch (requestError) {
      const errorCode = requestError.response?.data?.erro;
      setVerified(false);
      emitState(false, "");
      setError(buildCaptchaErrorMessage(errorCode));

      const shouldReloadChallenge = [
        "CAPTCHA_CHALLENGE_REUTILIZADO",
        "CAPTCHA_CHALLENGE_INVALIDO",
        "CAPTCHA_VERIFICACAO_FALHOU",
      ].includes(errorCode);

      if (shouldReloadChallenge || !isInTarget) {
        await fetchChallenge();
      }
    } finally {
      setVerifying(false);
    }
  };

  const isBusy = disabled || loadingChallenge || verifying;

  return (
    <div className="nb-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className="text-brand-primary dark:text-brand-accent" />
        <p className="text-xs font-black tracking-widest uppercase text-slate-600 dark:text-slate-300">
          <T>Verificacao humana</T>
        </p>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        <T>Arraste a peca para alinhar no marcador e confirme que voce e humano.</T>
      </p>

      <div className="relative h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-netlight-50 to-blue-100/70 dark:from-slate-900 dark:to-blue-950/70 overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg border-2 border-dashed border-blue-500/80 bg-blue-500/10"
          style={{ left: `calc(${challenge?.target ?? 50}% - 16px)` }}
          aria-hidden="true"
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-brand-primary shadow-lg shadow-brand-primary/30"
          style={{ left: `calc(${sliderValue}% - 16px)` }}
          aria-hidden="true"
        />
      </div>

      <input
        type="range"
        min={challenge?.min ?? 0}
        max={challenge?.max ?? 100}
        value={sliderValue}
        disabled={isBusy || verified || !challenge}
        onChange={(event) => {
          setSliderValue(Number(event.target.value));
          if (error) {
            setError("");
          }
        }}
        data-testid="human-puzzle-slider"
        className="w-full mt-3 accent-blue-600 disabled:opacity-60"
      />

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          disabled={isBusy || verified || !challenge}
          onClick={validate}
          className="nb-button-primary !py-2 !px-4 text-[11px]"
        >
          {verifying ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" />
              <T>Validando...</T>
            </span>
          ) : (
            <T>Validar humano</T>
          )}
        </button>

        <button
          type="button"
          disabled={disabled || loadingChallenge || verifying}
          onClick={fetchChallenge}
          className="nb-button-ghost !py-2 !px-3"
          title="Reiniciar puzzle"
        >
          <RotateCcw size={14} className={loadingChallenge ? "animate-spin" : ""} />
        </button>

        {verified && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            <T>Verificado</T>
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs mt-2 font-bold text-rose-600 dark:text-rose-400">
          <T>{error}</T>
        </p>
      )}
    </div>
  );
}

HumanPuzzleCaptcha.propTypes = {
  onVerified: PropTypes.func,
  disabled: PropTypes.bool,
  refreshSignal: PropTypes.number,
};

HumanPuzzleCaptcha.defaultProps = {
  onVerified: () => {},
  disabled: false,
  refreshSignal: 0,
};

export default HumanPuzzleCaptcha;
