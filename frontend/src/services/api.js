import axios from "axios";

// Instância centralizada para evitar "Red Lines" de conexão [cite: 2026-02-11]
const api = axios.create({
  baseURL: "http://localhost:8080", // Quando formos para AWS, mudaremos apenas esta linha
});

export default api;
