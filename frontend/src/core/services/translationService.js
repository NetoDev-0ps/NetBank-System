import { normalizeDisplayText } from "../utils/textSanitizer";

const VIP_CACHE = {
  en: {
    "Já sou cliente": "I am already a client",
    "Área Administrativa": "Admin area",
    "Começar agora": "Get started",
    "Acessar conta": "Access account",
    "Conta digital": "Digital account",
    "Cartão de crédito": "Credit card",
    Investimentos: "Investments",
    "Sobre Nós": "About us",
    Carreiras: "Careers",
    Imprensa: "Press",
    "Seja bem-vindo": "Welcome",
    Início: "Home",
    "Acessar Sistema": "Access system",
    "Entrar no NetBank": "Sign in to NetBank",
    "Não tem conta?": "Don't have an account?",
    "Abra agora": "Open now",
    "CPF incompleto": "Incomplete CPF",
    "Senha secreta": "Secret password",
    "E-mail administrativo": "Admin e-mail",
  },
  es: {
    "Já sou cliente": "Ya soy cliente",
    "Área Administrativa": "Área administrativa",
    "Começar agora": "Empezar ahora",
    "Acessar conta": "Acceder a la cuenta",
    "Conta digital": "Cuenta digital",
    "Cartão de crédito": "Tarjeta de crédito",
    Investimentos: "Inversiones",
    "Sobre Nós": "Sobre nosotros",
    Carreiras: "Carreras",
    Imprensa: "Prensa",
    "Seja bem-vindo": "Bienvenido",
    Início: "Inicio",
    "Acessar Sistema": "Acceder al sistema",
    "Entrar no NetBank": "Entrar en NetBank",
    "Não tem conta?": "¿No tienes cuenta?",
    "Abra agora": "Ábrela ahora",
    "CPF incompleto": "CPF incompleto",
    "Senha secreta": "Contraseña secreta",
    "E-mail administrativo": "Correo administrativo",
  },
};

const SUPPORTED_LOCALES = new Set(["en", "es"]);

const getCacheKey = (lang, text) => `netbank_v6_${lang}_${text}`;

const shouldUseVip = (lang, text) => VIP_CACHE[lang] && VIP_CACHE[lang][text];

export const translateText = async (text, targetLang) => {
  if (typeof text !== "string") {
    return text;
  }

  const sanitizedText = normalizeDisplayText(text).trim();

  if (!sanitizedText) {
    return sanitizedText;
  }

  if (targetLang === "pt" || !SUPPORTED_LOCALES.has(targetLang)) {
    return sanitizedText;
  }

  const vip = shouldUseVip(targetLang, sanitizedText);
  if (vip) {
    return normalizeDisplayText(vip);
  }

  const cacheKey = getCacheKey(targetLang, sanitizedText);
  const cached = typeof localStorage !== "undefined" ? localStorage.getItem(cacheKey) : null;

  if (cached) {
    return normalizeDisplayText(cached);
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sanitizedText)}&langpair=pt|${targetLang}`,
    );
    const data = await response.json();

    const translated = normalizeDisplayText(data?.responseData?.translatedText || "")
      .replace(/^[:;#\s]+|[:;#\s]+$/g, "")
      .replace(/#/g, "")
      .trim();

    if (!translated) {
      return sanitizedText;
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(cacheKey, translated);
    }

    return translated;
  } catch {
    return sanitizedText;
  }
};
