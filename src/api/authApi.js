import apiClient from "./apiClient";

const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  me: "/me",
  tenants: "/me/tenants",
  switchTenant: "/auth/switch-tenant"
};

export async function login(payload) {
  return apiClient.post(AUTH_ENDPOINTS.login, payload);
}

export async function register(payload) {
  return apiClient.post(AUTH_ENDPOINTS.register, payload);
}

export async function logout() {
  return apiClient.post(AUTH_ENDPOINTS.logout, {});
}

export async function getMe() {
  return apiClient.get(AUTH_ENDPOINTS.me);
}

export async function getTenants() {
  return apiClient.get(AUTH_ENDPOINTS.tenants);
}

export async function switchTenant(tenantId) {
  return apiClient.post(AUTH_ENDPOINTS.switchTenant, { tenantId });
}
