import { getToken } from "../auth/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getToken();
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText || "API request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function get(path, options) {
  return request(path, { method: "GET", ...options });
}

export function post(path, body, options) {
  return request(path, { method: "POST", body, ...options });
}

export function put(path, body, options) {
  return request(path, { method: "PUT", body, ...options });
}

export function del(path, options) {
  return request(path, { method: "DELETE", ...options });
}

export default {
  request,
  get,
  post,
  put,
  delete: del
};
