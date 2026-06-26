import apiClient from "../../../api/apiClient";

export async function listTenants() {
  const { data } = await apiClient.get("/me/tenants");
  return data;
}

export async function switchTenant(tenantId) {
  const { data } = await apiClient.post("/auth/switch-tenant", { tenantId });
  return data;
}
