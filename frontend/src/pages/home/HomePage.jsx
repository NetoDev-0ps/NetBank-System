import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  HandCoins,
  Headset,
  LockKeyhole,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import T from "../../shared/ui/Translate";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
  viewport: { once: true, margin: "-80px" },
};

const highlights = [
  {
    icon: LockKeyhole,
    title: "Segurança em várias camadas",
    description: "Proteção reforçada em login, transações e operações sensíveis.",
  },
  {
    icon: Smartphone,
    title: "Experiência pensada para celular",
    description: "Fluxo rápido no smartphone, com a mesma consistência no desktop.",
  },
  {
    icon: HandCoins,
    title: "Pix rápido de verdade",
    description: "Transferências em poucos toques, com confirmação clara e comprovante.",
  },
  {
    icon: Headset,
    title: "Atendimento que fala sua língua",
    description: "Suporte direto, com linguagem simples e orientação para quem não é técnico.",
  },
];

const plans = [
  {
    icon: CreditCard,
    title: "Conta NB Essential",
    price: "Sem mensalidade",
    description: "Conta para o dia a dia: Pix, cartão virtual e controle de gastos em tempo real.",
  },
  {
    icon: TrendingUp,
    title: "Conta NB Plus",
    price: "Benefícios premium",
    description: "Mais limite, atendimento prioritário e recursos para organizar metas financeiras.",
  },
  {
    icon: Building2,
    title: "Conta NB Empresas",
    price: "Gestão profissional",
    description: "Fluxo de aprovação, visão operacional e rotinas para pequenos e médios negócios.",
  },
];

const metrics = [
  { value: "+420 mil", label: "Clientes ativos" },
  { value: "98,2%", label: "Satisfação" },
  { value: "24/7", label: "Disponibilidade" },
  { value: "2 min", label: "Tempo médio no Pix" },
];

const footerColumns = [
  {
    title: "Conta e Cartão",
    items: ["Conta digital", "Cartão virtual", "Cartão físico", "Segurança de compras"],
  },
  {
    title: "Transferências",
    items: ["Pix", "Agendamentos", "Comprovantes", "Histórico"],
  },
  {
    title: "Banco NB",
    items: ["Quem somos", "Carreiras", "Imprensa", "Sustentabilidade"],
  },
  {
    title: "Ajuda",
    items: ["Central de ajuda", "Ouvidoria", "Privacidade", "Termos"],
  },
];

function HomePage() {
  return (
    <div className="nb-page">
      <header className="nb-topbar">
        <div className="nb-shell py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/brand-logo-primary.png" alt="NetBank" className="h-9 w-auto" />
            <span className="hidden sm:inline nb-eyebrow"><T>Banco NB</T></span>
          </div>

          <nav className="flex items-center gap-2">
            <Link to="/login-cliente" className="nb-button-ghost !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Entrar</T>
            </Link>
            <Link to="/cadastro-cliente" className="nb-button-primary !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Abrir conta</T>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="nb-shell pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="nb-hero-grid">
            <motion.div {...fadeUp}>
              <span className="nb-chip">
                <Sparkles size={14} />
                <T>Conta digital para a vida real</T>
              </span>

              <h1 className="mt-5 text-[clamp(2rem,7vw,3.9rem)] font-extrabold leading-[1.05] text-slate-900 dark:text-white">
                <T>Seu dinheiro organizado</T>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent nb-aurora">
                  <T>sem complicação</T>
                </span>
              </h1>

              <p className="nb-copy mt-5 max-w-2xl">
                <T>
                  Abra sua conta, acompanhe saldo em tempo real e use Pix, cartão e transferências com segurança de ponta a ponta.
                </T>
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/cadastro-cliente" className="nb-button-primary w-full sm:w-auto">
                  <T>Abrir minha conta</T>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login-cliente" className="nb-button-secondary w-full sm:w-auto">
                  <T>Já sou cliente</T>
                </Link>
                <Link to="/login-gerente" className="nb-button-ghost w-full sm:w-auto">
                  <T>Acesso do gerente</T>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metrics.map((item) => (
                  <article key={item.label} className="nb-kpi">
                    <p className="nb-eyebrow"><T>{item.label}</T></p>
                    <p className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                  </article>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="nb-card p-4 sm:p-5 nb-tilt">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                <img
                  src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1600&q=80"
                  alt="Pessoa usando aplicativo de banco digital"
                  className="h-[280px] sm:h-[380px] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-transparent">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
                    <T>Banco NB App</T>
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-white">
                    <T>Conta, cartão e Pix no mesmo app, com navegação clara</T>
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="nb-card-soft p-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center nb-pulse-ring">
                    <BadgeCheck size={18} />
                  </div>
                  <p className="mt-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <T>Confiável no dia a dia</T>
                  </p>
                </div>
                <div className="nb-card-soft p-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <p className="mt-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <T>Uso simples</T>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="nb-shell pb-16 sm:pb-20">
          <div className="nb-grid-cards md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <motion.article key={item.title} {...fadeUp} className="nb-panel">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-brand-primary dark:text-brand-accent flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h2 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">
                    <T>{item.title}</T>
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    <T>{item.description}</T>
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="nb-shell pb-16 sm:pb-24">
          <motion.div {...fadeUp} className="nb-glass overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr,0.9fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="nb-eyebrow"><T>Planos NetBank</T></p>
                <h2 className="nb-section-title mt-2 text-slate-900 dark:text-white">
                  <T>Escolha a conta ideal para o seu momento</T>
                </h2>
                <p className="nb-copy mt-3 max-w-2xl">
                  <T>
                    Da rotina pessoal à gestão de uma empresa, o NetBank mantém a mesma proposta: clareza no uso e segurança nas operações.
                  </T>
                </p>

                <div className="mt-6 grid gap-3 sm:gap-4">
                  {plans.map((plan) => {
                    const Icon = plan.icon;

                    return (
                      <article key={plan.title} className="nb-card-soft p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                              <Icon size={18} />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                <T>{plan.title}</T>
                              </h3>
                              <p className="text-xs font-black uppercase tracking-wider text-brand-primary dark:text-brand-accent">
                                <T>{plan.price}</T>
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                          <T>{plan.description}</T>
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                <p className="nb-eyebrow !text-blue-100"><T>Destaque do mês</T></p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  <T>Abra sua conta e comece no mesmo dia</T>
                </h3>
                <p className="mt-3 text-sm text-blue-100/90">
                  <T>
                    Cadastro rápido, análise segura e acesso completo aos recursos de conta digital, Pix e cartão.
                  </T>
                </p>

                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80"
                  alt="Pessoa realizando pagamento pelo celular"
                  className="mt-5 h-52 sm:h-64 w-full rounded-2xl object-cover border border-white/20"
                />

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link to="/cadastro-cliente" className="nb-button-primary w-full sm:w-auto">
                    <T>Abrir conta</T>
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/login-cliente" className="nb-button-secondary !bg-white/10 !border-white/30 !text-white w-full sm:w-auto">
                    <T>Entrar no app</T>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="nb-footer">
        <div className="nb-shell pt-12 pb-6">
          <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur p-5 sm:p-7 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80">
                  <T>Banco NB</T>
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  <T>Pronto para simplificar sua vida financeira?</T>
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/login-cliente" className="nb-button-secondary !border-white/35 !text-white !bg-white/10">
                  <T>Entrar como cliente</T>
                </Link>
                <Link to="/cadastro-cliente" className="nb-button-primary">
                  <T>Abrir conta agora</T>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,1fr,1fr]">
            <div>
              <img src="/brand-logo-primary.png" alt="NetBank" className="h-10 w-auto" />
              <p className="mt-4 text-sm text-blue-100/80 max-w-xs">
                <T>Banco digital com foco em simplicidade, segurança e relacionamento de longo prazo.</T>
              </p>
              <p className="mt-3 text-xs text-blue-200/75">contato@netbank.com.br</p>
              <p className="text-xs text-blue-200/75">+55 (11) 4000-2026</p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-black tracking-widest uppercase text-blue-100">
                  <T>{column.title}</T>
                </p>
                <ul className="mt-3 space-y-2 text-sm text-blue-100/80">
                  {column.items.map((item) => (
                    <li key={item}><T>{item}</T></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-200/75">
            <p><T>2026 NetBank S.A. Todos os direitos reservados.</T></p>
            <div className="flex items-center gap-4">
              <span><T>Privacidade</T></span>
              <span><T>Termos</T></span>
              <span><T>Transparência</T></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
