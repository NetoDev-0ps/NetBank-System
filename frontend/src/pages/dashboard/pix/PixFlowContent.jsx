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

export function PixLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 font-sans text-slate-900 dark:text-white bg-netlight-50 dark:bg-slate-950">
      <div className="space-y-3 text-center">
        <div className="w-12 h-12 mx-auto border-2 rounded-full border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin" />
        <p className="text-xs font-black tracking-widest uppercase text-slate-400">
          <T>Carregando Pix...</T>
        </p>
      </div>
    </div>
  );
}

export function PixFatalState({ error, onBack, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 font-sans text-slate-900 dark:text-white bg-netlight-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex items-center justify-center w-20 h-20 mx-auto border bg-rose-600/10 rounded-3xl border-rose-500/20 text-rose-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl italic font-black"><T>Falha ao carregar</T></h2>
        <p className="text-sm text-slate-400">{error || <T>Erro desconhecido.</T>}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="py-4 text-xs font-black tracking-widest uppercase transition-all border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-white hover:text-black"
          >
            <T>Voltar</T>
          </button>
          <button
            onClick={onRetry}
            className="py-4 text-xs font-black tracking-widest uppercase transition-all bg-blue-600 text-white rounded-2xl hover:bg-blue-500"
          >
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
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-2 text-blue-500 border bg-blue-600/10 rounded-3xl border-blue-500/20">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl italic font-black">
              {subEtapa === "DIGITAR" ? <T>Crie sua Senha</T> : <T>Confirme a Senha</T>}
            </h2>
            <PixPasswordDisplay value={subEtapa === "DIGITAR" ? senhaSetup : confirmacaoSenha} />
            <input
              ref={inputRef}
              type="tel"
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
              className="absolute opacity-0 pointer-events-none"
            />
            <div className="pt-4">
              {subEtapa === "DIGITAR" ? (
                <button
                  disabled={senhaSetup.length < 4}
                  onClick={() => setSubEtapa("CONFIRMAR")}
                  className="w-full py-5 text-xs font-black tracking-widest uppercase transition-all bg-blue-600 text-white rounded-2xl disabled:opacity-20"
                >
                  <T>Proximo Passo</T>
                </button>
              ) : (
                <div className="space-y-4">
                  <button
                    disabled={confirmacaoSenha.length < 4 || loading}
                    onClick={() => (senhaSetup === confirmacaoSenha ? finalizarSetupSenha() : setErro("Senhas nao batem"))}
                    className="w-full py-5 text-xs font-black tracking-widest uppercase bg-emerald-600 text-white rounded-2xl"
                  >
                    {loading ? <T>Salvando...</T> : <T>Confirmar Senha</T>}
                  </button>
                  <button
                    onClick={resetSetup}
                    className="flex items-center gap-2 mx-auto text-[10px] font-bold text-slate-500 uppercase"
                  >
                    <RotateCcw size={14} /> <T>Recomecar</T>
                  </button>
                </div>
              )}
            </div>
            {erro && <p className="text-rose-500 text-[10px] font-bold uppercase">{erro}</p>}
          </motion.div>
        )}

        {etapa === "CHAVE_SETUP" && (
          <motion.div
            key="chave"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 text-center"
          >
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-2 border text-emerald-500 bg-emerald-600/10 rounded-3xl border-emerald-500/20">
              <Fingerprint size={40} />
            </div>
            <div>
              <h2 className="text-2xl italic font-black"><T>Quase la!</T></h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                <T>Escolha qual dado ativar como sua Chave Pix</T>
              </p>
            </div>
            <div className="pt-6 space-y-4 text-left">
              <button
                onClick={() => handleAtivarChave("CPF", usuario.cpf)}
                className="flex items-center justify-between w-full p-6 transition-all border-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl hover:border-emerald-500 group"
              >
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1 group-hover:text-emerald-500">
                    <T>Meu CPF</T>
                  </p>
                  <p className="font-mono text-lg text-slate-700 dark:text-slate-200">
                    {formatarPeloTipo(usuario.cpf, "CPF")}
                  </p>
                </div>
                <CheckCircle2 size={24} className="text-slate-700 group-hover:text-emerald-500" />
              </button>
              <button
                onClick={() => handleAtivarChave("EMAIL", usuario.email)}
                className="flex items-center justify-between w-full p-6 transition-all border-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl hover:border-emerald-500 group"
              >
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1 group-hover:text-emerald-500">
                    <T>Meu E-mail</T>
                  </p>
                  <p className="font-mono text-sm text-slate-700 dark:text-slate-200">{usuario.email}</p>
                </div>
                <CheckCircle2 size={24} className="text-slate-700 group-hover:text-emerald-500" />
              </button>
            </div>
            {erro && <p className="text-rose-500 text-[10px] font-bold uppercase pt-4">{erro}</p>}
          </motion.div>
        )}

        {etapa === "HUB" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            <PixMenuButton
              icon={<Send size={24} />}
              label="Transferir"
              onClick={() => {
                setChaveDestino("");
                setEtapa("TRANSFERIR_CHAVE");
              }}
            />
            <PixMenuButton icon={<QrCode size={24} />} label="QR Code" />
            <PixMenuButton icon={<Smartphone size={24} />} label="Cobrar" />
            <PixMenuButton icon={<Key size={24} />} label="Chaves" onClick={carregarMinhasChaves} />
          </motion.div>
        )}

        {etapa === "GERENCIAR_CHAVES" && (
          <motion.div
            key="chaves"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl italic font-black"><T>Minhas Chaves</T></h2>

            <div className="space-y-3">
              {minhasChaves.length === 0 && (
                <p className="text-sm italic text-slate-500">
                  <T>Nenhuma chave cadastrada.</T>
                </p>
              )}
              {minhasChaves.map((chave) => (
                <div
                  key={chave.id}
                  className="flex items-center justify-between p-4 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl"
                >
                  <div>
                    <p className="text-[9px] font-black uppercase text-blue-500 mb-1">{chave.tipo}</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-200">
                      {formatarPeloTipo(chave.valor, chave.tipo)}
                    </p>
                  </div>
                  <button
                    onClick={() => abrirModalExclusao(chave.id)}
                    className="p-2 transition-colors text-slate-500 hover:text-rose-500 bg-slate-800/50 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {minhasChaves.length < 3 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 text-center">
                  <T>Cadastrar nova chave</T>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {!tiposCadastrados.includes("CPF") && (
                    <button
                      onClick={() => handleAtivarChave("CPF", usuario.cpf)}
                      className="py-4 bg-white dark:bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 transition-all col-span-2"
                    >
                      <T>CPF</T>
                    </button>
                  )}
                  {!tiposCadastrados.includes("TELEFONE") && (
                    <button
                      onClick={() => handleAtivarChave("TELEFONE", usuario.telefone)}
                      className="py-4 bg-white dark:bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 transition-all"
                    >
                      <T>Celular</T>
                    </button>
                  )}
                  {!tiposCadastrados.includes("EMAIL") && (
                    <button
                      onClick={() => handleAtivarChave("EMAIL", usuario.email)}
                      className="py-4 bg-white dark:bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 transition-all"
                    >
                      <T>E-mail</T>
                    </button>
                  )}
                </div>
                {erro && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase mt-4 text-center">{erro}</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {etapa === "TRANSFERIR_CHAVE" && (
          <motion.div
            key="key"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl italic font-black"><T>Para qual Chave?</T></h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Insira a chave..."
                value={chaveDestino}
                onChange={(event) => setChaveDestino(mascaraInputDinamica(event.target.value))}
                className="flex-1 p-5 font-mono text-lg transition-all border-2 outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-600"
              />
              <button
                onClick={() => buscarDestinatario()}
                disabled={loading}
                className="flex items-center justify-center px-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-500"
              >
                <Send size={20} />
              </button>
            </div>
            {erro && <p className="text-xs font-bold text-rose-500">{erro}</p>}

            {favoritos.length > 0 && (
              <div className="pt-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  <T>Favoritos</T>
                </h3>
                <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
                  {favoritos.map((fav) => (
                    <button
                      key={fav.chave}
                      onClick={() => buscarDestinatario(fav.chave)}
                      className="flex flex-col items-center flex-shrink-0 w-20 gap-2"
                    >
                      <div className="relative flex items-center justify-center text-blue-400 border rounded-full w-14 h-14 bg-slate-800 border-slate-700">
                        <User size={24} />
                        <div className="absolute p-1 rounded-full -bottom-1 -right-1 bg-white dark:bg-slate-900">
                          <Star size={10} fill="#f59e0b" className="text-yellow-500" />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center truncate w-full">
                        {fav.nome.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                <T>Recentes</T>
              </h3>
              {recentes.length === 0 ? (
                <p className="text-xs italic text-slate-600">
                  <T>Nenhum envio recente.</T>
                </p>
              ) : (
                <div className="space-y-2">
                  {recentes.map((rec) => {
                    const isFav = favoritos.some((fav) => fav.chave === rec.chave);
                    return (
                      <div
                        key={`${rec.chave}-${rec.nome}`}
                        className="flex items-center justify-between p-4 transition-colors border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <button
                          onClick={() => buscarDestinatario(rec.chave)}
                          className="flex items-center flex-1 gap-4 text-left"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-400">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{rec.nome}</p>
                            <p className="text-[10px] font-mono text-slate-500">{rec.cpfMascarado}</p>
                          </div>
                        </button>
                        <button onClick={() => toggleFavorito(rec)} className="p-3">
                          <Star
                            size={20}
                            className={isFav ? "text-yellow-500" : "text-slate-600"}
                            fill={isFav ? "#f59e0b" : "none"}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {etapa === "TRANSFERIR_VALOR" && (
          <motion.div
            key="val"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8 text-center"
          >
            <div className="p-6 border bg-blue-600/5 border-blue-500/20 rounded-3xl">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">
                <T>Para:</T>
              </p>
              <h3 className="text-xl font-black">{dadosDestino.nome}</h3>
              <p className="font-mono text-xs text-slate-500">{dadosDestino.cpfMascarado}</p>
            </div>
            <input
              type="number"
              placeholder="R$ 0,00"
              autoFocus
              onChange={(event) => setValorTransferencia(event.target.value)}
              className="w-full text-5xl font-black text-center text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-900"
            />
            <button
              onClick={() => {
                setErro("");
                if (!idempotencyKey) {
                  setIdempotencyKey(generateTransferIdempotencyKey());
                }
                setEtapa("TRANSFERIR_SENHA");
              }}
              className="w-full py-5 text-xs font-black tracking-widest uppercase bg-blue-600 rounded-2xl"
            >
              <T>Revisar Pagamento</T>
            </button>
          </motion.div>
        )}

        {etapa === "TRANSFERIR_SENHA" && (
          <motion.div
            key="pass-val"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 text-center"
          >
            <h2 className="text-2xl italic font-black"><T>Senha de 4 digitos</T></h2>
            <PixPasswordDisplay value={senhaValidacao} />
            <input
              ref={inputRef}
              type="tel"
              maxLength={4}
              value={senhaValidacao}
              onChange={(event) => setSenhaValidacao(event.target.value.replace(/\D/g, ""))}
              className="absolute opacity-0 pointer-events-none"
            />
            {erro && <p className="text-xs font-bold text-rose-500">{erro}</p>}
            <button
              onClick={realizarTransferencia}
              disabled={senhaValidacao.length < 4 || loading}
              className="w-full py-5 text-xs font-black tracking-widest uppercase bg-emerald-600 text-white rounded-2xl"
            >
              {loading ? <T>Processando...</T> : <T>Confirmar Pix</T>}
            </button>
          </motion.div>
        )}

        {etapa === "SUCESSO" && (
          <motion.div
            key="success"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="space-y-6 text-center"
          >
            <CheckCircle2 size={100} className="mx-auto text-emerald-500" />
            <h2 className="text-3xl italic font-black"><T>Pix Enviado!</T></h2>
            <div className="p-6 space-y-2 text-xs text-left border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl">
              <p>VALOR: R$ {Number.parseFloat(valorTransferencia || "0").toFixed(2)}</p>
              <p>PARA: {dadosDestino.nome}</p>
              <p className="text-[10px] text-slate-500 break-all">ID: {comprovante?.idTransacao}</p>
            </div>
            <button
              onClick={onFinish}
              className="w-full py-4 text-xs font-black uppercase transition-all border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-6 text-center border shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl"
            >
              <AlertCircle size={48} className="mx-auto mb-4 text-rose-500" />
              <h3 className="mb-2 text-xl italic font-bold"><T>Excluir Chave?</T></h3>
              <p className="mb-6 text-sm text-slate-400">
                <T>Esta acao nao pode ser desfeita e voce nao recebera mais transferencias por esta chave.</T>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setChaveParaExcluir(null)}
                  disabled={loading}
                  className="flex-1 py-3 font-bold text-white transition-colors bg-slate-800 rounded-xl hover:bg-slate-700"
                >
                  <T>Cancelar</T>
                </button>
                <button
                  onClick={confirmarExclusao}
                  disabled={loading}
                  className="flex-1 py-3 font-bold text-white transition-colors bg-rose-600 rounded-xl hover:bg-rose-500"
                >
                  {loading ? <T>A Excluir...</T> : <T>Sim, Excluir</T>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}