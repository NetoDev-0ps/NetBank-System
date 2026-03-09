import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Fingerprint,
  Key,
  QrCode,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { generateTransferIdempotencyKey, formatarPeloTipo, mascaraInputDinamica } from "./pixUtils";
import PixMenuButton from "./PixMenuButton";
import PixPasswordDisplay from "./PixPasswordDisplay";
import T from "../../../shared/ui/Translate";

const pageTransition = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.24 },
};

const InlineError = ({ text }) =>
  text ? (
    <p className="rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-900/25 dark:text-rose-300">
      {text}
    </p>
  ) : null;

export function PixLoadingState() {
  return (
    <div className="nb-page flex items-center justify-center p-5">
      <div className="nb-card w-full max-w-sm p-7 text-center">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-brand-primary/25 border-t-brand-primary animate-spin" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
          <T>Carregando área Pix...</T>
        </p>
      </div>
    </div>
  );
}

export function PixFatalState({ error, onBack, onRetry }) {
  return (
    <div className="nb-page flex items-center justify-center p-5">
      <div className="nb-card w-full max-w-md p-6 sm:p-7 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
          <AlertCircle size={32} />
        </div>

        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
          <T>Não foi possível carregar o Pix</T>
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {error || <T>Erro desconhecido.</T>}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onBack} className="nb-button-ghost w-full">
            <T>Voltar</T>
          </button>
          <button type="button" onClick={onRetry} className="nb-button-primary w-full">
            <T>Tentar novamente</T>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PixFlowContent({
  etapa,
  subEtapa,
  erro,
  loading,
  inputRef,
  senhaSetup,
  confirmacaoSenha,
  setSenhaSetup,
  setConfirmacaoSenha,
  setSubEtapa,
  finalizarSetupSenha,
  resetSetup,
  handleAtivarChave,
  usuario,
  minhasChaves,
  tiposCadastrados,
  carregarMinhasChaves,
  abrirModalExclusao,
  chaveParaExcluir,
  setChaveParaExcluir,
  confirmarExclusao,
  chaveDestino,
  setChaveDestino,
  buscarDestinatario,
  favoritos,
  recentes,
  toggleFavorito,
  dadosDestino,
  valorTransferencia,
  setValorTransferencia,
  setEtapa,
  setErro,
  idempotencyKey,
  setIdempotencyKey,
  senhaValidacao,
  setSenhaValidacao,
  realizarTransferencia,
  comprovante,
  onFinish,
}) {
  return (
    <>
      <AnimatePresence mode="wait">
        {etapa === "SENHA_SETUP" && (
          <motion.div key="SENHA_SETUP" {...pageTransition} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-blue-300/20 dark:text-blue-100">
                <ShieldCheck size={28} />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
                {subEtapa === "DIGITAR" ? <T>Crie sua senha Pix</T> : <T>Confirme sua senha Pix</T>}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                <T>A senha deve ter 4 dígitos e será usada para confirmar transferências.</T>
              </p>
            </div>

            <PixPasswordDisplay value={subEtapa === "DIGITAR" ? senhaSetup : confirmacaoSenha} />

            <input
              ref={inputRef}
              id="pix-password-setup"
              name="pixPasswordSetup"
              type="tel"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={subEtapa === "DIGITAR" ? senhaSetup : confirmacaoSenha}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");
                if (subEtapa === "DIGITAR") {
                  setSenhaSetup(value);
                } else {
                  setConfirmacaoSenha(value);
                }
              }}
              className="sr-only"
            />

            {subEtapa === "DIGITAR" ? (
              <button
                type="button"
                disabled={senhaSetup.length < 4}
                onClick={() => setSubEtapa("CONFIRMAR")}
                className="nb-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
              >
                <T>Próximo passo</T>
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={confirmacaoSenha.length < 4 || loading}
                  onClick={() =>
                    senhaSetup === confirmacaoSenha
                      ? finalizarSetupSenha()
                      : setErro("As senhas não conferem.")
                  }
                  className="nb-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? <T>Salvando...</T> : <T>Confirmar senha</T>}
                </button>
                <button type="button" onClick={resetSetup} className="nb-button-ghost w-full">
                  <RotateCcw size={14} />
                  <T>Recomeçar</T>
                </button>
              </div>
            )}

            <InlineError text={erro} />
          </motion.div>
        )}

        {etapa === "CHAVE_SETUP" && (
          <motion.div key="CHAVE_SETUP" {...pageTransition} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Fingerprint size={28} />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
                <T>Ative sua primeira chave Pix</T>
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                <T>Escolha um dado seu para começar a receber transferências.</T>
              </p>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => handleAtivarChave("CPF", usuario.cpf)}
                className="nb-card-soft group flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="nb-eyebrow"><T>CPF</T></p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {formatarPeloTipo(usuario.cpf, "CPF")}
                  </p>
                </div>
                <CheckCircle2 size={20} className="text-slate-400 transition-colors group-hover:text-emerald-500" />
              </button>

              <button
                type="button"
                onClick={() => handleAtivarChave("EMAIL", usuario.email)}
                className="nb-card-soft group flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="nb-eyebrow"><T>E-mail</T></p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white break-all">{usuario.email}</p>
                </div>
                <CheckCircle2 size={20} className="text-slate-400 transition-colors group-hover:text-emerald-500" />
              </button>
            </div>

            <InlineError text={erro} />
          </motion.div>
        )}

        {etapa === "HUB" && (
          <motion.div key="HUB" {...pageTransition} className="space-y-5">
            <div>
              <p className="nb-eyebrow"><T>Área Pix</T></p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                <T>O que você deseja fazer agora?</T>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <PixMenuButton
                icon={<Send size={20} />}
                label="Transferir"
                onClick={() => {
                  setChaveDestino("");
                  setErro("");
                  setEtapa("TRANSFERIR_CHAVE");
                }}
              />
              <PixMenuButton
                icon={<QrCode size={20} />}
                label="QR Code"
                onClick={() => setErro("Função em desenvolvimento.")}
              />
              <PixMenuButton
                icon={<Smartphone size={20} />}
                label="Cobrar"
                onClick={() => setErro("Função em desenvolvimento.")}
              />
              <PixMenuButton icon={<Key size={20} />} label="Chaves" onClick={carregarMinhasChaves} />
            </div>

            <InlineError text={erro} />
          </motion.div>
        )}

        {etapa === "GERENCIAR_CHAVES" && (
          <motion.div key="GERENCIAR_CHAVES" {...pageTransition} className="space-y-5">
            <div>
              <p className="nb-eyebrow"><T>Gestão</T></p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                <T>Minhas chaves Pix</T>
              </h2>
            </div>

            <div className="space-y-3">
              {minhasChaves.length === 0 ? (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  <T>Nenhuma chave cadastrada.</T>
                </p>
              ) : (
                minhasChaves.map((chave) => (
                  <article key={chave.id} className="nb-card-soft flex items-center justify-between p-4">
                    <div>
                      <p className="nb-eyebrow">{chave.tipo}</p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {formatarPeloTipo(chave.valor, chave.tipo)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirModalExclusao(chave.id)}
                      className="nb-button-ghost !p-2.5"
                      title="Excluir chave"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))
              )}
            </div>

            {minhasChaves.length < 3 && (
              <div className="nb-card-soft p-4 sm:p-5">
                <p className="nb-eyebrow"><T>Adicionar nova chave</T></p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {!tiposCadastrados.includes("CPF") && (
                    <button
                      type="button"
                      onClick={() => handleAtivarChave("CPF", usuario.cpf)}
                      className="nb-button-secondary"
                    >
                      <T>CPF</T>
                    </button>
                  )}
                  {!tiposCadastrados.includes("TELEFONE") && (
                    <button
                      type="button"
                      onClick={() => handleAtivarChave("TELEFONE", usuario.telefone)}
                      className="nb-button-secondary"
                    >
                      <T>Telefone</T>
                    </button>
                  )}
                  {!tiposCadastrados.includes("EMAIL") && (
                    <button
                      type="button"
                      onClick={() => handleAtivarChave("EMAIL", usuario.email)}
                      className="nb-button-secondary"
                    >
                      <T>E-mail</T>
                    </button>
                  )}
                </div>
              </div>
            )}

            <InlineError text={erro} />
          </motion.div>
        )}

        {etapa === "TRANSFERIR_CHAVE" && (
          <motion.div key="TRANSFERIR_CHAVE" {...pageTransition} className="space-y-5">
            <div>
              <p className="nb-eyebrow"><T>Transferência</T></p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                <T>Digite a chave do destinatário</T>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="pix-destination-key"
                name="pixDestinationKey"
                type="text"
                placeholder="CPF, telefone ou e-mail"
                value={chaveDestino}
                onChange={(event) => setChaveDestino(mascaraInputDinamica(event.target.value))}
                className="nb-input flex-1"
              />
              <button
                type="button"
                onClick={() => buscarDestinatario()}
                disabled={loading}
                className="nb-button-primary !px-4"
              >
                <Send size={16} />
              </button>
            </div>

            <InlineError text={erro} />

            {favoritos.length > 0 && (
              <section>
                <p className="nb-eyebrow"><T>Favoritos</T></p>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {favoritos.map((fav) => (
                    <button
                      type="button"
                      key={fav.chave}
                      onClick={() => buscarDestinatario(fav.chave)}
                      className="nb-card-soft min-w-[5.25rem] p-3 text-center"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                        <User size={16} />
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                        {fav.nome?.split(" ")?.[0] || "Contato"}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="nb-eyebrow"><T>Recentes</T></p>
              {recentes.length === 0 ? (
                <p className="mt-2 text-sm italic text-slate-500 dark:text-slate-400">
                  <T>Nenhuma transferência recente.</T>
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {recentes.map((rec) => {
                    const isFav = favoritos.some((fav) => fav.chave === rec.chave);
                    return (
                      <article key={`${rec.chave}-${rec.nome}`} className="nb-card-soft flex items-center justify-between p-3">
                        <button
                          type="button"
                          onClick={() => buscarDestinatario(rec.chave)}
                          className="flex flex-1 items-center gap-3 text-left"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                            <User size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{rec.nome}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {rec.cpfMascarado || formatarPeloTipo(rec.chave, rec.chaveTipo)}
                            </p>
                          </div>
                        </button>
                        <button type="button" onClick={() => toggleFavorito(rec)} className="nb-button-ghost !p-2">
                          <Star
                            size={16}
                            className={isFav ? "text-amber-500" : "text-slate-400"}
                            fill={isFav ? "#f59e0b" : "none"}
                          />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {etapa === "TRANSFERIR_VALOR" && (
          <motion.div key="TRANSFERIR_VALOR" {...pageTransition} className="space-y-6 text-center">
            <div className="nb-card-soft p-5">
              <p className="nb-eyebrow"><T>Destinatário</T></p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{dadosDestino.nome}</h3>
              <p className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">{dadosDestino.cpfMascarado}</p>
            </div>

            <div>
              <label htmlFor="pix-transfer-amount" className="nb-eyebrow"><T>Valor</T></label>
              <input
                id="pix-transfer-amount"
                name="pixTransferAmount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                autoFocus
                value={valorTransferencia}
                onChange={(event) => setValorTransferencia(event.target.value)}
                className="mt-2 w-full bg-transparent text-center text-5xl font-extrabold text-slate-900 outline-none placeholder:text-slate-300 dark:text-white"
              />
            </div>

            <InlineError text={erro} />

            <button
              type="button"
              onClick={() => {
                setErro("");

                const valor = Number.parseFloat(String(valorTransferencia).replace(",", "."));
                if (!Number.isFinite(valor) || valor <= 0) {
                  setErro("Informe um valor maior que zero.");
                  return;
                }

                if (Number(dadosDestino?.idDestino) === Number(usuario?.id)) {
                  setErro("Não é permitido transferir para sua própria conta.");
                  return;
                }

                if (!idempotencyKey) {
                  setIdempotencyKey(generateTransferIdempotencyKey());
                }
                setEtapa("TRANSFERIR_SENHA");
              }}
              className="nb-button-primary w-full"
            >
              <T>Revisar e continuar</T>
            </button>
          </motion.div>
        )}

        {etapa === "TRANSFERIR_SENHA" && (
          <motion.div key="TRANSFERIR_SENHA" {...pageTransition} className="space-y-6 text-center">
            <div>
              <p className="nb-eyebrow"><T>Confirmação</T></p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                <T>Digite a senha Pix</T>
              </h2>
            </div>

            <PixPasswordDisplay value={senhaValidacao} />

            <input
              ref={inputRef}
              id="pix-password-confirm"
              name="pixPasswordConfirm"
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={senhaValidacao}
              onChange={(event) => setSenhaValidacao(event.target.value.replace(/\D/g, ""))}
              className="sr-only"
            />

            <InlineError text={erro} />

            <button
              type="button"
              onClick={realizarTransferencia}
              disabled={senhaValidacao.length < 4 || loading}
              className="nb-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? <T>Processando...</T> : <T>Confirmar Pix</T>}
            </button>
          </motion.div>
        )}

        {etapa === "SUCESSO" && (
          <motion.div key="SUCESSO" {...pageTransition} className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              <CheckCircle2 size={42} />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white"><T>Pix enviado com sucesso!</T></h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                <T>Transferência concluída com sucesso.</T>
              </p>
            </div>

            <div className="nb-card-soft p-4 text-left">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white"><T>Valor:</T></strong>{" "}
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  Number.parseFloat(valorTransferencia || "0") || 0,
                )}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white"><T>Para:</T></strong> {dadosDestino.nome}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300"><T>ID:</T></strong> {comprovante?.idTransacao}
              </p>
            </div>

            <button type="button" onClick={onFinish} className="nb-button-primary w-full">
              <T>Concluir</T>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chaveParaExcluir && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="nb-card w-full max-w-sm p-6"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
                <AlertCircle size={28} />
              </div>

              <h3 className="mt-4 text-center text-xl font-extrabold text-slate-900 dark:text-white">
                <T>Excluir chave Pix?</T>
              </h3>
              <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                <T>Esta ação remove a chave de forma definitiva.</T>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChaveParaExcluir(null)}
                  disabled={loading}
                  className="nb-button-ghost w-full"
                >
                  <T>Cancelar</T>
                </button>
                <button
                  type="button"
                  onClick={confirmarExclusao}
                  disabled={loading}
                  className="nb-button-danger w-full disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? <T>Excluindo...</T> : <T>Excluir</T>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
