import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se o token caiu ou é inválido, expulsa para a Home
      localStorage.clear();
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);
export default api;
