import apiClient from "./apiClient";

export async function getInvoices(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.fromDate) query.append("fromDate", params.fromDate);
  if (params.toDate) query.append("toDate", params.toDate);
  if (params.customerId) query.append("customerId", params.customerId);
  if (params.exerciceId) query.append("exerciceId", params.exerciceId);
  query.append("page", params.page || 0);
  query.append("size", params.size || 20);

  return apiClient.get(`/invoices?${query.toString()}`);
}

export async function getInvoice(id) {
  return apiClient.get(`/invoices/${id}`);
}

export async function createInvoice(payload) {
  return apiClient.post("/invoices", payload);
}

export async function updateInvoice(id, payload) {
  return apiClient.put(`/invoices/${id}`, payload);
}

export async function updateInvoiceStatus(id, status) {
  return apiClient.put(`/invoices/${id}/status`, { status });
}

export async function getInvoiceStatusHistory(id) {
  return apiClient.get(`/invoices/${id}/status-history`);
}

export async function addInvoicePayment(id, payload) {
  return apiClient.post(`/invoices/${id}/payments`, payload);
}

export async function deleteInvoicePayment(id, paymentId) {
  return apiClient.delete(`/invoices/${id}/payments/${paymentId}`);
}

export async function deleteInvoice(id) {
  return apiClient.delete(`/invoices/${id}`);
}
