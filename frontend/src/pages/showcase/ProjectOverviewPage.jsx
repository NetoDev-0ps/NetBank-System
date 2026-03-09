import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  Database,
  Layers,
  Rocket,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import T from "../../shared/ui/Translate";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
  viewport: { once: true, margin: "-80px" },
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Regra de negócio no backend",
    description: "Status de conta, permissões e transições críticas não dependem do front-end.",
  },
  {
    icon: Workflow,
    title: "Fluxos completos de ponta a ponta",
    description: "Cadastro, aprovação gerencial, primeiro acesso e Pix conectados entre API, banco e UI.",
  },
  {
    icon: Database,
    title: "Banco versionado com Flyway",
    description: "Migrations como fonte única para reduzir diferenças entre ambiente local e deploy.",
  },
  {
    icon: Rocket,
    title: "Pronto para demonstração técnica",
    description: "Build, lint e testes cobrindo pontos críticos para reduzir surpresa em apresentação.",
  },
];

const engineeringSignals = [
  "Arquitetura em camadas fácil de explicar em entrevista.",
  "Tratamento de erros padronizado com códigos claros.",
  "Autenticação e sessão com cenário real de produto (cookie + CSRF).",
  "Refatoração incremental sem quebrar os fluxos principais.",
  "UI mobile-first com boa leitura em telas maiores.",
];

const stackCards = [
  {
    icon: Layers,
    title: "Frontend",
    body: "React + Vite, componentes reutilizáveis, tema claro/escuro e localização pt/en/es.",
  },
  {
    icon: BrainCircuit,
    title: "Backend",
    body: "Spring Boot com validações, RBAC, auditoria e contratos de API previsíveis.",
  },
  {
    icon: Database,
    title: "Dados",
    body: "PostgreSQL + Flyway com migrações incrementais e controle de consistência.",
  },
];

function ProjectOverviewPage() {
  return (
    <div className="nb-page">
      <header className="nb-topbar">
        <div className="nb-shell py-4 flex items-center justify-between gap-3">
          <img src="/brand-logo-primary.png" alt="NetBank" className="h-9 w-auto" />

          <div className="flex items-center gap-2">
            <Link to="/home" className="nb-button-secondary !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Entrar no site do banco</T>
            </Link>
            <Link to="/login-gerente" className="nb-button-primary !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Abrir painel gerente</T>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="nb-shell pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="nb-hero-grid">
            <motion.div {...fadeUp}>
              <span className="nb-chip">
                <ClipboardCheck size={14} />
                <T>Visão técnica para recrutadores</T>
              </span>

              <h1 className="mt-5 text-[clamp(2rem,7vw,3.6rem)] font-extrabold leading-[1.06] text-slate-900 dark:text-white">
                <T>Como este projeto foi construído</T>
              </h1>

              <p className="nb-copy mt-4 max-w-2xl">
                <T>
                  O objetivo não era só montar uma interface bonita. A entrega foi pensada para funcionar de ponta a ponta, com regra no backend, fluxo consistente no frontend e banco versionado com Flyway.
                </T>
              </p>
              <p className="nb-copy mt-3 max-w-2xl">
                <T>
                  Em resumo: um projeto de portfólio com decisões reais de produto e engenharia, pronto para discussão técnica.
                </T>
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/home" className="nb-button-primary w-full sm:w-auto">
                  <T>Ver experiência completa do banco</T>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login-cliente" className="nb-button-ghost w-full sm:w-auto">
                  <T>Testar fluxo de cliente</T>
                </Link>
              </div>
            </motion.div>

            <motion.aside {...fadeUp} className="nb-panel nb-mesh-bg">
              <p className="nb-eyebrow"><T>Sinais de maturidade técnica</T></p>
              <div className="mt-4 grid gap-2.5">
                {engineeringSignals.map((signal) => (
                  <article key={signal} className="nb-card-soft p-3">
                    <p className="text-sm text-slate-700 dark:text-slate-200"><T>{signal}</T></p>
                  </article>
                ))}
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="nb-shell pb-16 sm:pb-20">
          <div className="nb-grid-cards md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((item) => {
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
          <motion.div {...fadeUp} className="nb-glass p-5 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
              <div>
                <p className="nb-eyebrow"><T>Stack e arquitetura</T></p>
                <h2 className="nb-section-title mt-2 text-slate-900 dark:text-white">
                  <T>Tecnologia aplicada com foco em produto</T>
                </h2>
              </div>

              <Link to="/home" className="nb-button-secondary w-full lg:w-auto">
                <T>Ir para landing do banco</T>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stackCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="nb-card-soft p-4 sm:p-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                      <Icon size={19} />
                    </div>
                    <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
                      <T>{item.title}</T>
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      <T>{item.body}</T>
                    </p>
                  </article>
                );
              })}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

export default ProjectOverviewPage;
