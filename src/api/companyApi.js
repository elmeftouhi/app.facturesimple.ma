import apiClient from "./apiClient";

export async function getCompany() {
  return apiClient.request("/company", { method: "GET" }).catch((err) => {
    if (err.status === 404) return null;
    throw err;
  });
}

export async function createCompany(payload) {
  return apiClient.post("/company", payload);
}

export async function updateCompany(payload) {
  return apiClient.put("/company", payload);
}

export async function deleteCompany() {
  return apiClient.delete("/company");
}

export async function getBanks() {
  return apiClient.get("/company/banks");
}

export async function addBank(payload) {
  return apiClient.post("/company/banks", payload);
}

export async function updateBank(bankId, payload) {
  return apiClient.put(`/company/banks/${bankId}`, payload);
}

export async function setDefaultBank(bankId) {
  return apiClient.put(`/company/banks/${bankId}/default`, {});
}

export async function deleteBank(bankId) {
  return apiClient.delete(`/company/banks/${bankId}`);
}
