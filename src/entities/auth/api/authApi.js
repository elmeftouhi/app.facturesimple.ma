import apiClient from "../../../api/apiClient";

const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  me: "/me",
  tenants: "/me/tenants",
  switchTenant: "/auth/switch-tenant"
};

export async function login(payload) {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.login, payload);
  return data;
}

export async function register(payload) {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.register, payload);
  return data;
}

export async function logout() {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.logout, {});
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get(AUTH_ENDPOINTS.me);
  return data;
}

export async function getTenants() {
  const { data } = await apiClient.get(AUTH_ENDPOINTS.tenants);
  return data;
}

export async function switchTenant(tenantId) {
  const { data } = await apiClient.post(AUTH_ENDPOINTS.switchTenant, { tenantId });
  return data;
}
