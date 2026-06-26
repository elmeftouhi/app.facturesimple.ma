import * as apiClient from "../api/apiClient";

const LOGIN_ENDPOINT = "/auth/login";
const REGISTER_ENDPOINT = "/auth/register";
const LOGOUT_ENDPOINT = "/auth/logout";
const ME_ENDPOINT = "/me";
const TENANTS_ENDPOINT = "/me/tenants";

export async function login(payload) {
  return apiClient.post(LOGIN_ENDPOINT, payload);
}

export async function register(payload) {
  return apiClient.post(REGISTER_ENDPOINT, payload);
}

export async function logout() {
  return apiClient.post(LOGOUT_ENDPOINT, {});
}

export async function getMe() {
  return apiClient.get(ME_ENDPOINT);
}

export async function getTenants() {
  return apiClient.get(TENANTS_ENDPOINT);
}

export async function switchTenant(tenantId) {
  // the backend expects { tenantId } in the body and returns a new token
  return apiClient.post("/auth/switch-tenant", { tenantId });
}
