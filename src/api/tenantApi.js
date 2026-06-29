import apiClient from "./apiClient";

export async function listTenants() {
  return apiClient.get("/me/tenants");
}

export async function switchTenant(tenantId) {
  return apiClient.post("/auth/switch-tenant", { tenantId });
}
