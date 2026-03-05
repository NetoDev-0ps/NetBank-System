import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  Headphones,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react";
import WindFlow from "../../shared/effects/WindFlowCanvas";
import T from "../../shared/ui/Translate";

const premiumCards = [
  {
    icon: WalletCards,
    title: "Conta digital completa",
    description:
      "Acompanhe seu saldo, organize seus gastos e resolva sua rotina financeira em poucos toques.",
    image:
      "https://images.unsplash.com/photo-1616077167599-cad3639c5a44?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: CreditCard,
    title: "Cartão com controle total",
    description:
      "Visualize limite, ajuste preferências e acompanhe movimentações em tempo real no app.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: PiggyBank,
    title: "Planejamento para crescer",
    description:
      "Metas, organização e uma experiência clara para quem quer cuidar melhor do dinheiro.",
    image:
      "https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac?auto=format&fit=crop&w=1200&q=80",
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: "Segurança ativa",
    text: "Monitoramento e camadas de proteção para sua conta todos os dias.",
  },
  {
    icon: Smartphone,
    title: "App mobile-first",
    text: "Navegação fluida para celular, com adaptação completa para desktop.",
  },
  {
    icon: Headphones,
    title: "Atendimento próximo",
    text: "Suporte humanizado para ajudar você com rapidez quando precisar.",
  },
  {
    icon: Building2,
    title: "Soluções para empresa",
    text: "Acesso empresarial para gestão de contas e acompanhamento operacional.",
  },
];

const numbers = [
  { label: "Clientes ativos", value: "+350 mil" },
  { label: "Atendimentos resolvidos", value: "97%" },
  { label: "Transações por mês", value: "+12 mi" },
  { label: "Disponibilidade", value: "24h" },
];

const footerColumns = [
  {
    title: "Para você",
    items: ["Conta digital", "Transferências", "Cartão", "Pix"],
  },
  {
    title: "Para empresas",
    items: ["Conta PJ", "Gestão operacional", "Painel empresarial", "Atendimento dedicado"],
  },
  {
    title: "Banco NB",
    items: ["Quem somos", "Carreiras", "Imprensa", "Parceiros"],
  },
  {
    title: "Suporte",
    items: ["Central de ajuda", "Fale conosco", "Ouvidoria", "Status da plataforma"],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
  viewport: { once: true, margin: "-70px" },
};

function HomePage() {
  return (
    <div className="nb-page">
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <WindFlow />
      </div>

      <div className="nb-glow w-[420px] h-[420px] -top-24 -left-20 bg-brand-accent/20" />
      <div className="nb-glow w-[460px] h-[460px] top-[38%] -right-28 bg-brand-primary/20" />

      <header className="nb-topbar">
        <div className="nb-shell py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/brand-logo-primary.png" alt="NetBank" className="h-9 w-auto" />
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-300">
              <T>Banco NB</T>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login-cliente" className="nb-button-ghost !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Entrar</T>
            </Link>
            <Link to="/cadastro-cliente" className="nb-button-primary !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Abrir conta</T>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="nb-shell pt-10 pb-14 sm:pt-14 sm:pb-20">
          <div className="grid gap-7 lg:grid-cols-[1.05fr,0.95fr] items-start">
            <motion.div {...fadeUp} className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-blue-200 bg-blue-50 text-brand-primary dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
                <Sparkles size={14} />
                <T>Nova experiência NetBank</T>
              </span>

              <h1 className="mt-5 text-slate-900 dark:text-white">
                <T>Um banco digital feito</T>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                  <T>para simplificar sua vida</T>
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
                <T>
                  No NetBank você abre conta, acompanha seu dinheiro e resolve tudo em poucos passos, com uma experiência leve, clara e confiável.
                </T>
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/cadastro-cliente" className="nb-button-primary w-full sm:w-auto">
                  <T>Quero abrir minha conta</T>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login-cliente" className="nb-button-secondary w-full sm:w-auto">
                  <T>Já sou cliente</T>
                </Link>
                <Link to="/login-gerente" className="nb-button-ghost w-full sm:w-auto">
                  <T>Acesso empresarial</T>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {numbers.map((item) => (
                  <div key={item.label} className="nb-card-soft p-3 sm:p-4">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-300">
                      <T>{item.label}</T>
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2 nb-card p-4 sm:p-5 overflow-hidden">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1400&q=80"
                  alt="Cliente utilizando aplicativo bancário"
                  className="w-full h-[280px] sm:h-[360px] object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-transparent text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-100">
                    <T>Conta, cartão e transferências</T>
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-bold">
                    <T>Controle financeiro no seu ritmo, direto no app</T>
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="nb-card-soft p-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                    <BadgeCheck size={17} />
                  </div>
                  <p className="mt-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <T>Proteção contínua</T>
                  </p>
                </div>
                <div className="nb-card-soft p-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                    <Smartphone size={17} />
                  </div>
                  <p className="mt-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <T>Jornada sem fricção</T>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="nb-shell pb-14 sm:pb-20">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <motion.article key={item.title} {...fadeUp} className="nb-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-brand-primary dark:text-brand-accent flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h2 className="mt-4 !text-[1.1rem] text-slate-900 dark:text-white">
                    <T>{item.title}</T>
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    <T>{item.text}</T>
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="nb-shell pb-14 sm:pb-20">
          <motion.div {...fadeUp} className="nb-card p-5 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">
                  <T>Produtos para o seu momento</T>
                </p>
                <h2 className="mt-2 text-slate-900 dark:text-white">
                  <T>Soluções com visual premium e uso prático</T>
                </h2>
              </div>
              <Link to="/cadastro-cliente" className="nb-button-secondary w-full lg:w-auto">
                <T>Começar agora</T>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {premiumCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <img src={item.image} alt={item.title} className="w-full h-44 object-cover" />
                    <div className="p-4 sm:p-5">
                      <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                        <Icon size={17} />
                      </div>
                      <h3 className="mt-3 text-base font-black text-slate-900 dark:text-white">
                        <T>{item.title}</T>
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        <T>{item.description}</T>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="nb-shell pb-16 sm:pb-24">
          <motion.div {...fadeUp} className="nb-card overflow-hidden">
            <div className="grid lg:grid-cols-[1fr,1.2fr]">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-100">
                  <T>App NetBank</T>
                </p>
                <h2 className="mt-3">
                  <T>Controle sua vida financeira onde estiver</T>
                </h2>
                <p className="mt-4 text-sm text-blue-100/90">
                  <T>
                    Pague, transfira e acompanhe tudo em uma experiência que funciona bem no celular e no desktop.
                  </T>
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/login-cliente" className="nb-button-secondary !border-white/30 !text-white !bg-white/10 hover:!bg-white/20">
                    <T>Entrar no aplicativo</T>
                  </Link>
                  <Link to="/cadastro-cliente" className="nb-button-primary">
                    <T>Abrir conta</T>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1556742049-908e76bada09?auto=format&fit=crop&w=1400&q=80"
                  alt="Cliente fazendo pagamento digital"
                  className="w-full h-[280px] sm:h-[340px] object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative border-t border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-[#102140] to-[#071227] text-blue-100">
        <div className="nb-shell pt-12 pb-6">
          <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur p-5 sm:p-7 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-200/80">
                  <T>Banco NB</T>
                </p>
                <h2 className="mt-2 text-white">
                  <T>Pronto para começar sua jornada financeira?</T>
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/login-cliente" className="nb-button-secondary !border-white/30 !text-white !bg-white/10 hover:!bg-white/20">
                  <T>Entrar como cliente</T>
                </Link>
                <Link to="/cadastro-cliente" className="nb-button-primary">
                  <T>Abrir conta agora</T>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,1fr,1fr]">
            <div>
              <img src="/brand-logo-primary.png" alt="NetBank" className="h-10 w-auto" />
              <p className="mt-4 text-sm text-blue-100/80 max-w-xs">
                <T>
                  Um banco digital para quem busca praticidade, confiança e atendimento próximo todos os dias.
                </T>
              </p>
              <p className="mt-3 text-xs text-blue-200/70">contato@netbank.com.br</p>
              <p className="text-xs text-blue-200/70">+55 (11) 4000-2026</p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-black tracking-widest uppercase text-blue-200/90">
                  <T>{column.title}</T>
                </p>
                <ul className="mt-3 space-y-2">
                  {column.items.map((item) => (
                    <li key={item}>
                      <span className="text-sm text-blue-100/80">
                        <T>{item}</T>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-200/70">
            <p>
              <T>2026 NetBank S.A. Todos os direitos reservados.</T>
            </p>
            <div className="flex items-center gap-4">
              <span>
                <T>Privacidade</T>
              </span>
              <span>
                <T>Termos</T>
              </span>
              <span>
                <T>Transparência</T>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
