import apiClient from "./apiClient";

export async function getCustomers() {
  return apiClient.get("/customers");
}
