import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, CreditCard, Smartphone, TrendingUp, ChevronRight, Globe, MessageCircle, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube
} from "lucide-react";
import WindFlow from "../../shared/effects/WindFlowCanvas"; 

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    /* CONTAINER PRINCIPAL: Agora reativo ao fundo #BFCEF5 (definido no index.css) */
    <div className="min-h-screen overflow-x-hidden font-sans transition-colors duration-500 bg-[#BFCEF5] dark:bg-slate-950 text-slate-800 dark:text-white selection:bg-blue-500/30">
      
      {/* BACKGROUND ELEMENTS - ORIGINAIS */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <WindFlow />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-800/10 dark:bg-purple-600/10 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* NAVBAR - LOGO SEM ALTERAÇÃO DE COR */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <img src="/brand-logo-primary.png" alt="NetBank Logo" className="object-contain w-auto h-20 transition-opacity hover:opacity-90" />
        </div>

        <div className="flex gap-4">
          <Link to="/login-cliente" className="hidden px-5 py-2.5 text-sm font-bold transition border rounded-full md:block border-blue-800/20 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800 text-blue-900 dark:text-slate-300">
            Já sou cliente
          </Link>
          <Link to="/login-gerente" className="px-5 py-2.5 text-sm font-bold text-white transition bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-900/20">
            Área Administrativa
          </Link>
        </div>
      </nav>

     {/* HERO SECTION */}
      <main className="relative z-10 px-6 pt-20 pb-0 mx-auto max-w-7xl md:pt-20">
        
        {/* WRAPPER FLEX ADICIONADO PARA PERMITIR LAYOUT LADO A LADO */}
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
          
          {/* CÓDIGO ORIGINAL INTACTO */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-3xl">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-bold text-blue-800 uppercase border rounded-full dark:text-blue-400 bg-blue-500/10 dark:bg-blue-900/20 border-blue-400/20 dark:border-blue-800/50">
              <Zap size={12} /> O Futuro é Agora
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="py-8 mb-6 text-5xl font-extrabold leading-snug tracking-tight text-transparent md:text-7xl bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 dark:from-white dark:via-slate-200 dark:to-slate-500">
              O banco que <br /> joga a seu favor.
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-xl mb-10 text-lg font-medium leading-relaxed text-blue-900/70 dark:text-slate-400 md:text-xl">
              Sem taxas abusivas, sem filas e com a segurança que você merece. Controle sua vida financeira com a simplicidade de um toque.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
              <Link to="/cadastro-cliente" className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white transition bg-blue-600 shadow-xl rounded-2xl hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-blue-900/20">
                Começar agora <ArrowRight size={20} />
              </Link>
              <Link to="/login-cliente" className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-blue-900 transition border rounded-2xl border-blue-900/20 dark:border-slate-700 hover:bg-white/30 dark:hover:bg-slate-800 dark:text-slate-300">
                Acessar conta
              </Link>
            </motion.div>
          </motion.div>

          {/* NOVA ÁREA: ANIMAÇÃO DOS MASCOTES 3D */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 hidden w-full max-w-md lg:block xl:max-w-lg lg:ml-auto"
          >
            <motion.img 
              src="/business-people.png" /* Ajuste para o caminho/nome exato do seu arquivo na pasta public */
              alt="Mascotes NetBank" 
              className="w-full h-auto drop-shadow-2xl"
              animate={{ y: [0, -18, 0] }} // Animação de flutuação no eixo Y
              transition={{ 
                repeat: Infinity, 
                duration: 5, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>

        </div>
        
        {/* SECTION IPHONES (Original - Continua abaixo) */}
        <section className="mt-32 text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="pb-1 text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white md:text-6xl">
              Tudo que você precisa. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">Em um só app.</span>
            </h2>

            <div className="relative mt-1 group">
              <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full opacity-60" />
              <img src="/app-interface-mockup.png" alt="App NetBank" className="relative z-10 w-full max-w-5xl mx-auto drop-shadow-2xl transition-transform duration-700 hover:scale-[1.01]" />
            </div>
          </motion.div>
        </section>

        {/* SECTION CARDS - Usando bg-white/40 no modo claro para refletir o azul de fundo */}
        <section className="pb-12 border-t mb-14 border-blue-900/10 dark:border-slate-900/50">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="grid grid-cols-1 gap-12 mt-12 md:grid-cols-3 md:gap-8">
            <BigFeatureCard icon={<CreditCard size={40} />} title="Cartão de crédito" desc="Sem anuidade e com programa de pontos que nunca expiram." linkText="Conhecer cartões" />
            <BigFeatureCard icon={<Smartphone size={40} />} title="Conta digital" desc="Pix e transferências ilimitadas. Pague boletos e muito mais." linkText="Abra sua conta" />
            <BigFeatureCard icon={<TrendingUp size={40} />} title="Investimentos" desc="Acesse os melhores produtos do mercado com poucos cliques." linkText="Conhecer investimentos" />
          </motion.div>
        </section>
      </main>

      <FooterPremium />
    </div>
  );
};

// CARD COMPONENTE
const BigFeatureCard = ({ icon, title, desc, linkText }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="p-6 mb-6 text-blue-700 transition-all border rounded-3xl bg-white/40 dark:bg-slate-900/50 border-blue-900/10 dark:border-slate-800 group-hover:border-blue-500 dark:text-slate-300">
      {icon}
    </div>
    <h3 className="mb-4 text-2xl font-bold text-blue-950 dark:text-white">{title}</h3>
    <p className="max-w-sm mx-auto mb-8 leading-relaxed text-blue-900/70 dark:text-slate-400">{desc}</p>
    <a href="#" className="flex items-center gap-2 font-bold text-blue-600 transition-colors">
      {linkText} <ChevronRight size={16} />
    </a>
  </div>
);

// FOOTER PRESERVADO
const FooterPremium = () => (
  // Adicione estas importações no topo do seu Home.jsx junto com os outros ícones da lucide-react:
// import { Instagram, Twitter, MessageCircle, Linkedin, Youtube } from "lucide-react";(
  // O background utiliza o valor arbitrário #B1C0F5 para o modo claro e slate-800 para o modo escuro.
  <footer className="pt-20 pb-12 font-sans border-t bg-[#B1C0F5] dark:bg-slate-800 border-blue-900/10 dark:border-slate-900 text-blue-900/70 dark:text-slate-300">
    <div className="px-6 mx-auto max-w-7xl">
      
      {/* Grid de Links Principal */}
      <div className="grid grid-cols-2 gap-10 mb-16 md:grid-cols-4 lg:grid-cols-5">
        
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-white">NetBank</h4>
          {["Sobre Nós", "Carreiras", "Imprensa", "Sustentabilidade"].map(link => (
            <a key={link} href="#" className="text-sm transition-colors hover:text-blue-700 dark:hover:text-blue-400">{link}</a>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-white">Nossos Produtos</h4>
          {["Conta Corrente", "Cartões de Crédito", "Empréstimos", "Investimentos"].map(link => (
            <a key={link} href="#" className="text-sm transition-colors hover:text-blue-700 dark:hover:text-blue-400">{link}</a>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-white">Ajuda & Suporte</h4>
          {["Central de Ajuda", "Segurança", "Ouvidoria", "Taxas e Tarifas"].map(link => (
            <a key={link} href="#" className="text-sm transition-colors hover:text-blue-700 dark:hover:text-blue-400">{link}</a>
          ))}
        </div>

        <div className="flex flex-col col-span-2 gap-4 md:col-span-1 lg:col-span-2">
          <h4 className="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-white">Canais de Atendimento</h4>
          <div className="mb-2">
            <p className="mb-1 text-xs tracking-wider uppercase opacity-80">Capitais e regiões metropolitanas</p>
            <p className="text-base font-bold text-blue-800 dark:text-blue-400">3003 4070</p>
          </div>
          <div>
            <p className="mb-1 text-xs tracking-wider uppercase opacity-80">Demais localidades</p>
            <p className="text-base font-bold text-blue-800 dark:text-blue-400">0800 940 0007</p>
          </div>
        </div>

      </div>

      {/* Linha Inferior: Copyright e Redes Sociais */}
      <div className="flex flex-col-reverse items-center justify-between gap-6 pt-8 mt-16 border-t md:flex-row border-blue-900/10 dark:border-slate-700/50">
        
        <div className="text-xs font-medium text-center md:text-left text-blue-900/60 dark:text-slate-500">
          © 2026 NetBank S.A. CNPJ: 00.000.000/0001-00 <br className="block md:hidden" />
          <span className="hidden md:inline"> | </span> Av. Paulista, 1000 - São Paulo, SP
        </div>

        {/* Grupo de Ícones Sociais */}
        <div className="flex items-center gap-4">
          <a href="#" aria-label="WhatsApp" className="p-2 transition-all rounded-full bg-blue-900/5 dark:bg-slate-700/50 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 hover:scale-110">
             {/* Usando MessageCircle provisoriamente para WhatsApp caso não tenha o icone especifico */}
            <MessageCircle size={20} />
          </a>
          <a href="#" aria-label="Instagram" className="p-2 transition-all rounded-full bg-blue-900/5 dark:bg-slate-700/50 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 hover:scale-110">
            <Instagram size={20} />
          </a>
          <a href="#" aria-label="X (Twitter)" className="p-2 transition-all rounded-full bg-blue-900/5 dark:bg-slate-700/50 hover:bg-black hover:text-white dark:hover:bg-black hover:scale-110">
            <Twitter size={20} /> 
          </a>
          <a href="#" aria-label="LinkedIn" className="p-2 transition-all rounded-full bg-blue-900/5 dark:bg-slate-700/50 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-700 hover:scale-110">
            <Linkedin size={20} />
          </a>
          <a href="#" aria-label="YouTube" className="p-2 transition-all rounded-full bg-blue-900/5 dark:bg-slate-700/50 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 hover:scale-110">
            <Youtube size={20} />
          </a>
        </div>

      </div>
    </div>
  </footer>
);

export default Home;