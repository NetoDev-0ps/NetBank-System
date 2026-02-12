import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  CreditCard,
  Smartphone,
  TrendingUp,
  ChevronRight,
  Globe, // Adicionado para corrigir o erro do Footer
} from "lucide-react";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen overflow-x-hidden font-sans text-white bg-slate-950 selection:bg-blue-500/30">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <img
            src="/logo02.png"
            alt="NetBank Logo"
            className="object-contain w-auto h-20 transition-opacity hover:opacity-90"
          />
        </div>

        <div className="flex gap-4">
          <Link
            to="/login-cliente"
            className="hidden px-5 py-2.5 text-sm font-bold transition border rounded-full md:block border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            Já sou cliente
          </Link>
          <Link
            to="/login-gerente"
            className="px-5 py-2.5 text-sm font-bold text-white transition bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-900/20"
          >
            Área Administrativa
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 px-6 pt-20 pb-0 mx-auto max-w-7xl md:pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-bold text-blue-400 uppercase border rounded-full bg-blue-900/20 border-blue-800/50"
          >
            <Zap size={12} /> O Futuro é Agora
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="py-8 mb-6 text-5xl font-extrabold leading-snug tracking-tight text-transparent md:text-7xl bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500"
          >
            O banco que <br />
            joga a seu favor.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-xl mb-10 text-lg leading-relaxed text-slate-400 md:text-xl"
          >
            Sem taxas abusivas, sem filas e com a segurança que você merece.
            Controle sua vida financeira com a simplicidade de um toque.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/cadastro-cliente"
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white transition bg-blue-600 rounded-2xl hover:bg-blue-500 hover:scale-105 active:scale-95"
            >
              Começar agora <ArrowRight size={20} />
            </Link>
            <Link
              to="/login-cliente"
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold transition border rounded-2xl border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Acessar conta
            </Link>
          </motion.div>
        </motion.div>

        {/* 1. SECTION */}
        <section className="mt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="pb-1 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Tudo que você precisa. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Em um só app.
              </span>
            </h2>

            <div className="relative mt-1 group">
              {/* Efeito de Glow atrás da imagem */}
              <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

              <img
                src="/public/iphone01.png"
                alt="App NetBank nos iPhones"
                className=" relative z-10 w-full max-w-5xl mx-auto drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </motion.div>
        </section>

        {/* 2. SECTION */}
        <section className="pb-12 border-t mb-14 border-slate-900/50">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8"
          >
            {/* Feature 1: Cartão */}
            <BigFeatureCard
              icon={<CreditCard size={40} strokeWidth={1.5} />}
              title="Cartão de crédito"
              desc="Sem anuidade e com programa de pontos que nunca expiram. Controle total pelo app em tempo real."
              linkText="Conhecer cartões"
            />
            {/* Feature 2: Conta Digital */}
            <BigFeatureCard
              icon={<Smartphone size={40} strokeWidth={1.5} />}
              title="Conta digital completa"
              desc="Pix e transferências ilimitadas. Pague boletos, recarregue o celular e muito mais."
              linkText="Abra sua conta"
            />
            {/* Feature 3: Investimentos */}
            <BigFeatureCard
              icon={<TrendingUp size={40} strokeWidth={1.5} />}
              title="Investimentos"
              desc="Acesse os melhores produtos do mercado no Brasil e no exterior com poucos cliques."
              linkText="Conhecer investimentos"
            />
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <FooterPremium />
    </div>
  );
};

const BigFeatureCard = ({ icon, title, desc, linkText }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="p-6 mb-6 transition-colors border rounded-3xl bg-slate-900/50 border-slate-800 group-hover:border-blue-500/30 text-slate-300 group-hover:text-blue-400">
      {icon}
    </div>
    <h3 className="mb-4 text-2xl font-bold text-white">{title}</h3>
    <p className="max-w-sm mx-auto mb-8 leading-relaxed text-slate-400">
      {desc}
    </p>
    <a
      href="#"
      className="flex items-center gap-2 font-bold text-blue-500 transition-colors hover:text-blue-400 group-hover/link:gap-3"
    >
      {linkText}{" "}
      <ChevronRight
        size={16}
        className="transition-transform group-hover:translate-x-1"
      />
    </a>
  </div>
);

// --- COMPONENTE FOOTER PREMIUM  ---
const FooterPremium = () => {
  return (
    <footer className="pt-20 pb-12 font-sans border-t bg-slate-800 border-slate-900 text-slate-300">
      <div className="px-6 mx-auto max-w-7xl">
        {/* PARTE SUPERIOR: LINKS E LOJAS */}
        <div className="grid grid-cols-2 gap-10 mb-16 md:grid-cols-4 lg:grid-cols-5">
          {/* Coluna 1: Produtos */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">
              Nossos Produtos
            </h4>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Conta Corrente
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Cartão de Crédito
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Conta Internacional
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Conta PJ
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Empréstimos
            </a>
            <a
              href="#"
              className="text-sm font-bold text-blue-500 transition-colors hover:text-blue-400"
            >
              Mapa do Site
            </a>
          </div>

          {/* Coluna 2: Dúvidas */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">
              Dúvidas
            </h4>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Central de Ajuda
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Canal de Transparência
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Documentos e Tarifas
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              LGPD
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Renegociação
            </a>
          </div>

          {/* Coluna 3: Sobre Nós */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">
              Sobre Nós
            </h4>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Quem Somos
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Carreiras NetBank
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Blog
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Imprensa
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-blue-400"
            >
              Sustentabilidade
            </a>
          </div>

          {/* Coluna 4 e 5: Apps e Social */}
          <div className="flex flex-col items-start col-span-2 gap-6 lg:items-end">
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <button className="flex items-center gap-3 px-4 py-2 transition border rounded-lg border-slate-700 bg-slate-900/50 hover:bg-slate-800 group">
                <Smartphone
                  size={24}
                  className="text-slate-400 group-hover:text-white"
                />
                <div className="text-left">
                  <p className="text-[10px] uppercase text-slate-500">
                    Disponível no
                  </p>
                  <p className="text-sm font-bold text-white">Google Play</p>
                </div>
              </button>
              <button className="flex items-center gap-3 px-4 py-2 transition border rounded-lg border-slate-700 bg-slate-900/50 hover:bg-slate-800 group">
                <Globe
                  size={24}
                  className="text-slate-400 group-hover:text-white"
                />
                <div className="text-left">
                  <p className="text-[10px] uppercase text-slate-500">
                    Baixar na
                  </p>
                  <p className="text-sm font-bold text-white">App Store</p>
                </div>
              </button>
            </div>
            <div className="flex gap-6 mt-2">
              <a
                href="#"
                className="transition text-slate-500 hover:text-white"
              >
                IG
              </a>
              <a
                href="#"
                className="transition text-slate-500 hover:text-white"
              >
                X
              </a>
              <a
                href="#"
                className="transition text-slate-500 hover:text-white"
              >
                IN
              </a>
              <a
                href="#"
                className="transition text-slate-500 hover:text-white"
              >
                YT
              </a>
            </div>
          </div>
        </div>

        {/* SEPARADOR E PARTE INFERIOR (ATENDIMENTO) */}
        <div className="my-12 border-t border-slate-800" />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-2 text-xl font-bold text-white">Atendimento</h3>
            <p className="mb-6 text-xs text-slate-500">
              24 horas por dia, 7 dias por semana
            </p>
            <div className="mb-4">
              <p className="text-sm font-bold text-white">
                Acesse pelo celular
              </p>
              <a
                href="#"
                className="text-sm font-bold text-blue-500 hover:underline"
              >
                No chat do app
              </a>
            </div>
            <div>
              <p className="text-sm font-bold text-white">WhatsApp</p>
              <p className="text-sm font-bold text-blue-500">(11) 2832 6088</p>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="mb-4">
              <p className="text-sm font-bold text-white">
                Capitais e regiões metropolitanas
              </p>
              <p className="text-sm font-bold text-blue-500">3003 6116</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Demais localidades</p>
              <p className="text-sm font-bold text-blue-500">0800 660 6116</p>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold text-white">SAC</h3>
            <p className="mb-6 text-xs text-slate-500">
              24 horas por dia, 7 dias por semana
            </p>
            <div>
              <p className="text-sm font-bold text-white">Todas as regiões</p>
              <p className="text-sm font-bold text-blue-500">0800 660 0060</p>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold text-white">Ouvidoria</h3>
            <p className="mb-6 text-xs text-slate-500">
              Segunda a sexta, exceto feriados
            </p>
            <div className="mb-4">
              <p className="text-sm font-bold text-white">Das 9h às 18h</p>
              <p className="text-sm font-bold text-blue-500">0800 660 6060</p>
            </div>
            <a
              href="#"
              className="text-sm font-bold text-blue-500 hover:underline"
            >
              Página de ouvidoria
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-8 mt-16 text-xs text-center border-t border-slate-900 md:text-left md:flex-row text-slate-600">
          <p>© 2026 NetBank S.A. CNPJ: 00.000.000/0001-00</p>
          <p>Av. Paulista, 1000 - São Paulo, SP</p>
        </div>
      </div>
    </footer>
  );
};

export default Home;
