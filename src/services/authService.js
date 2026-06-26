import * as apiClient from "../api/apiClient";

const LOGIN_ENDPOINT = "/auth/login";
const REGISTER_ENDPOINT = "/auth/register";

export async function login(payload) {
  return apiClient.post(LOGIN_ENDPOINT, payload);
}

export async function register(payload) {
  return apiClient.post(REGISTER_ENDPOINT, payload);
}
