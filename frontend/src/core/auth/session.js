const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

const buildMemoryStorage = () => {
  const store = new Map();

  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
};

const storage = typeof sessionStorage !== "undefined"
  ? sessionStorage
  : buildMemoryStorage();

export const sessionKeys = {
  managerName: "usuario-nome",
  managerEmail: "usuario-email",
  managerRole: "usuario-cargo",
  customerData: "cliente_dados",
};

export function saveManagerSession(user) {
  storage.removeItem(sessionKeys.customerData);
  storage.setItem(sessionKeys.managerName, user?.nome ?? "");
  storage.setItem(sessionKeys.managerEmail, user?.email ?? "");
  storage.setItem(sessionKeys.managerRole, user?.cargo ?? "");
}

export function saveCustomerSession(user) {
  storage.removeItem(sessionKeys.managerName);
  storage.removeItem(sessionKeys.managerEmail);
  storage.removeItem(sessionKeys.managerRole);
  storage.setItem(sessionKeys.customerData, JSON.stringify(user));
}

export function getManagerRole() {
  return storage.getItem(sessionKeys.managerRole);
}

export function getManagerData() {
  const cargo = getManagerRole();
  if (!cargo) {
    return null;
  }

  return {
    nome: storage.getItem(sessionKeys.managerName) || "",
    email: storage.getItem(sessionKeys.managerEmail) || "",
    cargo,
  };
}

export function getCustomerData() {
  const raw = storage.getItem(sessionKeys.customerData);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAllSessions() {
  Object.values(sessionKeys).forEach((key) => storage.removeItem(key));
}

export function isManagerAuthenticated() {
  const role = getManagerRole();
  return role === "GERENTE" || role === "ADMIN";
}

export function isCustomerAuthenticated() {
  const user = getCustomerData();
  return !!user && user?.cargo === "CLIENTE";
}

export async function logout(redirectTo = "/home") {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // best effort logout
  }

  clearAllSessions();

  if (typeof window !== "undefined" && window.location) {
    window.location.href = redirectTo;
  }
}
