/** @type {import('tailwindcss').Config} */
export default {
  // Estratégia de tema habilitada para alternância via injeção da classe 'dark' no <html>
  darkMode: 'class', 
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Cores de Identidade da Marca (Legado)
        netMint: '#C5F5E0',
        netSky: '#9DEDF4',
        netBlue: '#3b82f6',
        
        // Design Tokens: Sistema Dual-Tone (NetBank v2.0)
        netTheme: {
          // Fundos principais da aplicação (Backgrounds)
          base: {
            light: '#BFCEF5', // Azul Soft (White Mode)
            dark: '#050505',  // Dark Padrão
          },
          // Superfícies sobrepostas (Cards, Footers, Headers)
          surface: {
            footer: '#B1C0F5', // Azul levemente mais escuro para contraste
          }
        }
      }
    },
  },
  plugins: [],
};