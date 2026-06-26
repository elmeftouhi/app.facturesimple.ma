import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authServiceApi from "../services/authService";
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
    const data = await authServiceApi.login(payload);
    const savedAuth = authStorage.saveAuth(data);
    
    try {
      const userInfo = await authServiceApi.getMe();
      savedAuth.user = userInfo;
      
      const tenantsResponse = await authServiceApi.getTenants();
      const tenants = Array.isArray(tenantsResponse) ? tenantsResponse : tenantsResponse?.data || [];
      savedAuth.tenants = tenants;
      savedAuth.selectedTenant = tenants?.[0] || null;
      
      authStorage.saveAuth(savedAuth);
    } catch (err) {
      console.error("Failed to fetch user info or tenants:", err);
    }
    
    setAuth(savedAuth);
    return data;
  };

  const register = async (payload) => {
    const data = await authServiceApi.register(payload);
    const savedAuth = authStorage.saveAuth(data);
    
    try {
      const userInfo = await authServiceApi.getMe();
      savedAuth.user = userInfo;
      
      const tenantsResponse = await authServiceApi.getTenants();
      const tenants = Array.isArray(tenantsResponse) ? tenantsResponse : tenantsResponse?.data || [];
      savedAuth.tenants = tenants;
      savedAuth.selectedTenant = tenants?.[0] || null;
      
      authStorage.saveAuth(savedAuth);
    } catch (err) {
      console.error("Failed to fetch user info or tenants:", err);
    }
    
    setAuth(savedAuth);
    return data;
  };

  const logout = async () => {
    try {
      await authServiceApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      authStorage.clearAuth();
      setAuth(null);
    }
  };

  const selectTenant = async (tenant) => {
    if (!auth) return;

    // optimistically set selected tenant while switching
    const optimistic = { ...auth, selectedTenant: tenant };
    setAuth(optimistic);

    try {
      const data = await authServiceApi.switchTenant(tenant.id || tenant.tenantId || tenant.name);
      // data expected to include a new token and optionally expiresAt
      const updated = {
        ...optimistic,
        token: data.token || data.accessToken || data.idToken || data.jwt || auth.token,
        expiresAt: data.expiresAt || data.expiresIn ? (data.expiresAt || (Date.now() + (data.expiresIn || 0) * 1000)) : auth.expiresAt
      };

      // persist and refresh user/tenants if provided
      if (data.user) updated.user = data.user;
      if (data.tenants) updated.tenants = data.tenants;

      authStorage.saveAuth(updated);
      setAuth(updated);
    } catch (err) {
      console.error("Failed to switch tenant:", err);
      // revert on failure
      setAuth(auth);
    }
  };

  const refreshUser = async () => {
    if (!auth) return null;
    try {
      const userInfo = await authServiceApi.getMe();
      const updated = { ...auth, user: userInfo };
      authStorage.saveAuth(updated);
      setAuth(updated);
      return userInfo;
    } catch (err) {
      console.error("Failed to refresh user info:", err);
      return null;
    }
  };

  const value = useMemo(
    () => ({ auth, isAuthenticated, login, register, logout, selectTenant, refreshUser }),
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
