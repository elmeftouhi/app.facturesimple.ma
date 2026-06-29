import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import { buildAuthSession, normalizeTenantList } from "../utils/authMappers";
import * as authStorage from "../auth/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = authStorage.getAuth();
    return stored && !authStorage.isExpired(stored) ? stored : null;
  });

  useEffect(() => {
    if (auth && authStorage.isExpired(auth)) {
      authStorage.clearAuth();
      setAuth(null);
    }
  }, [auth]);

  const isAuthenticated = Boolean(auth?.token && !authStorage.isExpired(auth));

  const login = async (payload) => {
    const data = await authApi.login(payload);
    const savedAuth = authStorage.saveAuth(buildAuthSession(data));

    try {
      const [userInfo, tenantsResponse] = await Promise.all([authApi.getMe(), authApi.getTenants()]);
      const tenants = normalizeTenantList(tenantsResponse);
      const updated = {
        ...savedAuth,
        user: userInfo,
        tenants,
        selectedTenant: tenants?.[0] || null
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
      const updated = {
        ...savedAuth,
        user: userInfo,
        tenants,
        selectedTenant: tenants?.[0] || null
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
    }
  };

  const selectTenant = async (tenant) => {
    if (!auth) return;

    const optimistic = { ...auth, selectedTenant: tenant };
    setAuth(optimistic);

    try {
      const data = await authApi.switchTenant(tenant.id || tenant.tenantId || tenant.name);
      const updated = {
        ...optimistic,
        token: data.token || data.accessToken || data.idToken || data.jwt || auth.token,
        expiresAt: data.expiresAt || data.expiresIn ? (data.expiresAt || (Date.now() + (data.expiresIn || 0) * 1000)) : auth.expiresAt
      };

      if (data.user) updated.user = data.user;
      if (data.tenants) updated.tenants = data.tenants;

      authStorage.saveAuth(updated);
      setAuth(updated);
    } catch (err) {
      console.error("Failed to switch tenant:", err);
      setAuth(auth);
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
    () => ({ auth, isAuthenticated, login, register, logout, selectTenant, refreshUser, refreshTenants }),
    [auth, isAuthenticated]
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
