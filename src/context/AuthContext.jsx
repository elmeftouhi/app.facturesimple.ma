import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import * as exerciceApi from "../api/exerciceApi";
import { buildAuthSession, normalizeTenantList } from "../utils/authMappers";
import * as authStorage from "../auth/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = authStorage.getAuth();
    return stored && !authStorage.isExpired(stored) ? stored : null;
  });

  // Fiscal Years (Exercices) States
  const [exercices, setExercices] = useState([]);
  const [selectedExercice, setSelectedExercice] = useState(null);

  useEffect(() => {
    if (auth && authStorage.isExpired(auth)) {
      authStorage.clearAuth();
      setAuth(null);
    }
  }, [auth]);

  const isAuthenticated = Boolean(auth?.token && !authStorage.isExpired(auth));

  const refreshExercices = async (tenantId) => {
    if (!auth) return [];
    try {
      const list = await exerciceApi.getExercices();
      setExercices(list || []);

      const activeTenantId = tenantId || auth?.selectedTenant?.id;
      if (!activeTenantId) return list;

      const stored = localStorage.getItem(`fs_exercice_${activeTenantId}`);
      let parsed = null;
      if (stored) {
        try {
          parsed = JSON.parse(stored);
        } catch (e) {}
      }

      // If stored preference matches an item in the retrieved list, select it.
      // Otherwise, select the first OPEN exercice, or fall back to the first available one.
      const match = list.find((e) => e.id === parsed?.id);
      if (match) {
        setSelectedExercice(match);
      } else {
        const active = list.find((e) => e.status === "OPEN") || list?.[0] || null;
        setSelectedExercice(active);
        if (active) {
          localStorage.setItem(`fs_exercice_${activeTenantId}`, JSON.stringify(active));
        }
      }
      return list;
    } catch (err) {
      console.error("Failed to refresh exercices:", err);
      return [];
    }
  };

  const selectExercice = (exercice) => {
    setSelectedExercice(exercice);
    const activeTenantId = auth?.selectedTenant?.id;
    if (activeTenantId && exercice) {
      localStorage.setItem(`fs_exercice_${activeTenantId}`, JSON.stringify(exercice));
    }
  };

  // Auto-refresh fiscal years when tenant switches
  useEffect(() => {
    if (auth?.selectedTenant?.id) {
      refreshExercices(auth.selectedTenant.id);
    } else {
      setExercices([]);
      setSelectedExercice(null);
    }
  }, [auth?.selectedTenant?.id]);

  const login = async (payload) => {
    const data = await authApi.login(payload);
    const savedAuth = authStorage.saveAuth(buildAuthSession(data));

    try {
      const [userInfo, tenantsResponse] = await Promise.all([authApi.getMe(), authApi.getTenants()]);
      const tenants = normalizeTenantList(tenantsResponse);
      const activeTenant = tenants.find((t) => t.id === userInfo?.currentTenantId) || tenants?.[0] || null;
      const updated = {
        ...savedAuth,
        user: userInfo,
        tenants,
        selectedTenant: activeTenant
      };

      authStorage.saveAuth(updated);
      setAuth(updated);
      return data;
    } catch (err) {
      console.error("Failed to fetch user info or tenants after login:", err);
    }

    setAuth(savedAuth);
    return data;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    const savedAuth = authStorage.saveAuth(buildAuthSession(data));

    try {
      const [userInfo, tenantsResponse] = await Promise.all([authApi.getMe(), authApi.getTenants()]);
      const tenants = normalizeTenantList(tenantsResponse);
      const activeTenant = tenants.find((t) => t.id === userInfo?.currentTenantId) || tenants?.[0] || null;
      const updated = {
        ...savedAuth,
        user: userInfo,
        tenants,
        selectedTenant: activeTenant
      };

      authStorage.saveAuth(updated);
      setAuth(updated);
      return data;
    } catch (err) {
      console.error("Failed to fetch user info or tenants after register:", err);
    }

    setAuth(savedAuth);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      authStorage.clearAuth();
      setAuth(null);
      setExercices([]);
      setSelectedExercice(null);
    }
  };

  const selectTenant = async (tenant) => {
    if (!auth) return;

    try {
      const data = await authApi.switchTenant(tenant.id || tenant.tenantId || tenant.name);
      const updated = {
        ...auth,
        selectedTenant: tenant,
        token: data.token || data.accessToken || data.idToken || data.jwt || auth.token,
        expiresAt: data.expiresAt || data.expiresIn ? (data.expiresAt || (Date.now() + (data.expiresIn || 0) * 1000)) : auth.expiresAt
      };

      if (data.user) updated.user = data.user;
      if (data.tenants) updated.tenants = data.tenants;

      authStorage.saveAuth(updated);
      setAuth(updated);
      
      // Fetch new workspace fiscal years
      await refreshExercices(tenant.id);
    } catch (err) {
      console.error("Failed to switch tenant:", err);
    }
  };

  const refreshUser = async () => {
    if (!auth) return null;
    try {
      const userInfo = await authApi.getMe();
      const updated = { ...auth, user: userInfo };
      authStorage.saveAuth(updated);
      setAuth(updated);
      return userInfo;
    } catch (err) {
      console.error("Failed to refresh user info:", err);
      return null;
    }
  };

  const refreshTenants = async () => {
    if (!auth) return [];
    try {
      const tenantsResponse = await authApi.getTenants();
      const tenantsList = normalizeTenantList(tenantsResponse);
      const updated = { ...auth, tenants: tenantsList };
      authStorage.saveAuth(updated);
      setAuth(updated);
      return tenantsList;
    } catch (err) {
      console.error("Failed to refresh tenants:", err);
      return auth.tenants || [];
    }
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated,
      login,
      register,
      logout,
      selectTenant,
      refreshUser,
      refreshTenants,
      exercices,
      selectedExercice,
      selectExercice,
      refreshExercices
    }),
    [auth, isAuthenticated, exercices, selectedExercice]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
