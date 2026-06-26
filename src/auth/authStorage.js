const AUTH_STORAGE_KEY = "facture-simple-auth";

function getNow() {
  return Date.now();
}

function normalizeExpiry(data) {
  if (!data) {
    return null;
  }

  if (typeof data.expiresAt === "number") {
    return data.expiresAt;
  }

  if (typeof data.expiresAt === "string") {
    const parsed = Date.parse(data.expiresAt);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof data.expiresIn === "number") {
    return getNow() + data.expiresIn * 1000;
  }

  if (typeof data.expiresIn === "string" && !Number.isNaN(Number(data.expiresIn))) {
    return getNow() + Number(data.expiresIn) * 1000;
  }

  return null;
}

export function saveAuth(data) {
  const token = data.token || data.accessToken || data.idToken || data.jwt;
  if (!token) {
    throw new Error("Missing auth token in response.");
  }

  const expiresAt = normalizeExpiry(data);
  const payload = {
    token,
    expiresAt,
    user: data.user || null,
    tenants: data.tenants || null,
    selectedTenant: data.selectedTenant || null
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function getAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isExpired(auth) {
  if (!auth || !auth.token) {
    return true;
  }

  if (!auth.expiresAt) {
    return false;
  }

  return getNow() >= auth.expiresAt;
}

export function getToken() {
  const auth = getAuth();
  if (!auth || isExpired(auth)) {
    clearAuth();
    return null;
  }

  return auth.token;
}
