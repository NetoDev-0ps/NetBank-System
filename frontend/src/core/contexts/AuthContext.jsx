import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import api from "../api/apiClient";
import { ensureCsrfToken } from "../auth/csrf";
import {
  clearAllSessions,
  getCustomerData,
  getManagerData,
  logout as logoutSession,
  saveCustomerSession,
  saveManagerSession,
} from "../auth/session";

const AuthContext = createContext(null);

const isManagerRole = (role) => role === "GERENTE" || role === "ADMIN";

export function AuthProvider({ children }) {
  const [customerUser, setCustomerUser] = useState(() => getCustomerData());
  const [managerUser, setManagerUser] = useState(() => getManagerData());
  const [authResolved, setAuthResolved] = useState(false);

  const applyUser = useCallback((user) => {
    const role = user?.cargo?.toUpperCase();

    if (role === "CLIENTE") {
      saveCustomerSession(user);
      setCustomerUser(user);
      setManagerUser(null);
      return;
    }

    if (isManagerRole(role)) {
      saveManagerSession(user);
      setManagerUser(user);
      setCustomerUser(null);
      return;
    }

    clearAllSessions();
    setCustomerUser(null);
    setManagerUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await ensureCsrfToken();

      const response = await api.get("/auth/me", {
        meta: { skipAuthHandling: true },
      });
      const user = response.data?.usuario;

      if (!user) {
        clearAllSessions();
        setCustomerUser(null);
        setManagerUser(null);
      } else {
        applyUser(user);
      }
    } catch {
      clearAllSessions();
      setCustomerUser(null);
      setManagerUser(null);
    } finally {
      setAuthResolved(true);
    }
  }, [applyUser]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loginCustomer = useCallback(
    (user) => {
      applyUser(user);
      setAuthResolved(true);
    },
    [applyUser],
  );

  const loginManager = useCallback(
    (user) => {
      applyUser(user);
      setAuthResolved(true);
    },
    [applyUser],
  );

  const logout = useCallback((redirectTo = "/home") => {
    logoutSession(redirectTo);
  }, []);

  const managerRole = managerUser?.cargo ?? "";
  const isCustomerAuth = !!customerUser && customerUser?.cargo === "CLIENTE";
  const isManagerAuth = isManagerRole(managerRole);

  const value = useMemo(
    () => ({
      customerUser,
      managerUser,
      managerRole,
      authResolved,
      isCustomerAuthenticated: isCustomerAuth,
      isManagerAuthenticated: isManagerAuth,
      refreshSession,
      loginCustomer,
      loginManager,
      logout,
    }),
    [
      customerUser,
      managerUser,
      managerRole,
      authResolved,
      isCustomerAuth,
      isManagerAuth,
      refreshSession,
      loginCustomer,
      loginManager,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider");
  }
  return context;
}

