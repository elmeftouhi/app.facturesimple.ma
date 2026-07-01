import apiClient from "./apiClient";

export async function getExercices() {
  return apiClient.get("/exercices");
}

export async function createExercice(payload) {
  return apiClient.post("/exercices", payload);
}

export async function updateExerciceStatus(id, status) {
  return apiClient.put(`/exercices/${id}/status`, { status });
}
