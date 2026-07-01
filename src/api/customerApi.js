import apiClient from "./apiClient";

// Customer CRUD
export async function getCustomers() {
  return apiClient.get("/customers");
}

export async function createCustomer(payload) {
  return apiClient.post("/customers", payload);
}

export async function updateCustomer(id, payload) {
  return apiClient.put(`/customers/${id}`, payload);
}

export async function deleteCustomer(id) {
  return apiClient.delete(`/customers/${id}`);
}

// Customer Categories CRUD
export async function getCustomerCategories() {
  return apiClient.get("/customer-categories");
}

export async function createCustomerCategory(payload) {
  return apiClient.post("/customer-categories", payload);
}

export async function updateCustomerCategory(id, payload) {
  return apiClient.put(`/customer-categories/${id}`, payload);
}

export async function deleteCustomerCategory(id) {
  return apiClient.delete(`/customer-categories/${id}`);
}

export async function setDefaultCustomerCategory(id) {
  return apiClient.put(`/customer-categories/${id}/default`);
}

export async function unsetDefaultCustomerCategory(id) {
  return apiClient.delete(`/customer-categories/${id}/default`);
}
