import {
  getMe as getMeAuth,
  getTenants as getTenantsAuth,
  login as loginAuth,
  logout as logoutAuth,
  register as registerAuth,
  switchTenant as switchTenantAuth
} from "../entities/auth/api/authApi";

export async function login(payload) {
  return loginAuth(payload);
}

export async function register(payload) {
  return registerAuth(payload);
}

export async function logout() {
  return logoutAuth();
}

export async function getMe() {
  return getMeAuth();
}

export async function getTenants() {
  return getTenantsAuth();
}

export async function switchTenant(tenantId) {
  return switchTenantAuth(tenantId);
}
