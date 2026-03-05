import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  Code2,
  Database,
  GitBranch,
  Globe,
  Server,
  ShieldCheck,
} from "lucide-react";
import WindFlow from "../../shared/effects/WindFlowCanvas";
import T from "../../shared/ui/Translate";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Seguranca veio primeiro",
    description:
      "Antes de pensar em tela bonita, a base foi fechada com autenticacao consistente, controle de permissao e trilha de auditoria.",
  },
  {
    icon: Server,
    title: "Backend simples de entender",
    description:
      "As regras principais ficaram no service, com controller enxuto e resposta previsivel para o front. Isso facilita manutencao e revisao de codigo.",
  },
  {
    icon: Database,
    title: "Banco com historico confiavel",
    description:
      "Flyway controla evolucao de schema para reduzir surpresa em ambiente local, Docker e futuros deploys.",
  },
  {
    icon: Activity,
    title: "Fluxos criticos tratados com cuidado",
    description:
      "Login, primeiro acesso, status de conta e operacoes de gerente passaram por ajustes para diminuir brechas logicas.",
  },
];

const stack = [
  {
    icon: Code2,
    layer: "Frontend",
    details:
      "React + Vite, Tailwind, Framer Motion, modo claro/escuro, i18n e telas planejadas para uso real em celular.",
  },
  {
    icon: Globe,
    layer: "API",
    details:
      "Spring Boot com contratos REST, validacoes de entrada, RBAC e sessao protegida por JWT em cookie HttpOnly.",
  },
  {
    icon: Database,
    layer: "Dados",
    details:
      "PostgreSQL, migracoes Flyway e estrutura pronta para crescer sem precisar recriar banco a cada ajuste.",
  },
  {
    icon: GitBranch,
    layer: "Qualidade",
    details:
      "Build, lint e testes em fluxos principais para reduzir regressao e dar mais seguranca para evolucao continua.",
  },
];

const recruiterSignals = [
  "A arquitetura conversa entre front, backend e banco sem gambiarra de ultima hora.",
  "As regras de negocio mais sensiveis nao ficaram presas no front-end.",
  "Sessao, permissao e tratamento de erro foram tratados como tema de produto, nao so de infraestrutura.",
  "A base esta pronta para continuar evoluindo com escopo maior sem perder legibilidade.",
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
  viewport: { once: true, margin: "-60px" },
};

function ProjectOverviewPage() {
  return (
    <div className="nb-page">
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <WindFlow />
      </div>

      <div className="nb-glow w-[420px] h-[420px] -top-24 -left-16 bg-brand-accent/25" />
      <div className="nb-glow w-[420px] h-[420px] top-[42%] -right-20 bg-brand-primary/20" />

      <header className="nb-topbar">
        <div className="nb-shell py-4 flex items-center justify-between gap-3">
          <img src="/brand-logo-primary.png" alt="NetBank" className="h-9 w-auto" />

          <div className="flex items-center gap-2">
            <Link to="/home" className="nb-button-ghost !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Entrar no site</T>
            </Link>
            <Link to="/login-gerente" className="nb-button-primary !py-2.5 !px-4 text-[10px] sm:text-xs">
              <T>Area gerente</T>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="nb-shell pt-10 pb-14 sm:pt-14 sm:pb-20">
          <div className="grid gap-7 lg:grid-cols-[1.15fr,0.85fr] items-start">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-blue-200 bg-blue-50 text-brand-primary dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
                <ClipboardCheck size={14} />
                <T>Resumo tecnico para recrutadores</T>
              </span>

              <h1 className="mt-5 text-slate-900 dark:text-white">
                <T>Se voce esta avaliando este portfolio,</T>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                  <T>aqui estao as decisoes que importam</T>
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
                <T>
                  Este projeto nasceu com um objetivo simples: mostrar maturidade de engenharia em um contexto bancario, equilibrando seguranca, legibilidade de codigo e experiencia de uso para quem nao e tecnico.
                </T>
              </p>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
                <T>
                  Nao e uma vitrine de buzzword. E uma base funcional, com escolhas praticas, onde cada camada foi ajustada para reduzir risco de regressao e facilitar evolucao.
                </T>
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/home" className="nb-button-primary w-full sm:w-auto">
                  <T>Entrar na Home NetBank</T>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login-cliente" className="nb-button-secondary w-full sm:w-auto">
                  <T>Testar fluxo cliente</T>
                </Link>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="nb-card p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">
                <T>O que eu priorizei</T>
              </p>

              <div className="mt-4 space-y-3">
                {recruiterSignals.map((signal) => (
                  <div key={signal} className="nb-card-soft p-3">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      <T>{signal}</T>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="nb-shell pb-14 sm:pb-20">
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((item) => {
              const Icon = item.icon;

              return (
                <motion.article key={item.title} {...fadeUp} className="nb-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-brand-primary dark:text-brand-accent flex items-center justify-center">
                    <Icon size={20} />
                  </div>

                  <h2 className="mt-4 !text-[1.2rem] text-slate-900 dark:text-white">
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
          <motion.div {...fadeUp} className="nb-card p-5 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">
                  <T>Stack por camada</T>
                </p>
                <h2 className="mt-2 text-slate-900 dark:text-white">
                  <T>Tecnologias usadas com objetivo claro</T>
                </h2>
              </div>

              <Link to="/home" className="nb-button-secondary w-full lg:w-auto">
                <T>Ver experiencia completa do banco</T>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {stack.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.layer} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                        <Icon size={18} />
                      </div>
                      <p className="text-sm font-black tracking-wide uppercase text-slate-800 dark:text-slate-100">
                        <T>{item.layer}</T>
                      </p>
                    </div>

                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      <T>{item.details}</T>
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 nb-card-soft p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">
                <T>Leitura final</T>
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                <T>
                  Se eu precisasse resumir em uma frase: e um projeto que saiu do estado experimental e virou uma base consistente para continuar crescendo com criterio tecnico.
                </T>
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

export default ProjectOverviewPage;
