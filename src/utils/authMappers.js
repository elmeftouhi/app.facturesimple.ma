export function normalizeUser(user) {
  return user || null;
}

export function normalizeTenantList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
}

export function getTenantKey(tenant) {
  return tenant?.id ?? tenant?.tenantId ?? tenant?.name ?? null;
}

export function isSelectedTenant(selectedTenant, tenant) {
  const selectedKey = getTenantKey(selectedTenant);
  const tenantKey = getTenantKey(tenant);
  return selectedKey != null && selectedKey === tenantKey;
}

export function buildAuthSession(data) {
  const payload = data?.data || data?.payload || data?.result || data || {};
  const token = payload?.token || payload?.accessToken || payload?.access_token || payload?.jwt || payload?.jwtToken;

  if (!token) {
    const headers = data?.headers || {};
    const headerToken = headers.authorization || headers.Authorization || headers["x-auth-token"] || headers["x-access-token"];
    const tokenVal = typeof headerToken === "string" && headerToken.toLowerCase().startsWith("bearer ")
      ? headerToken.slice(7).trim()
      : headerToken;

    if (!tokenVal) {
      throw new Error("Missing auth token in response.");
    }
    return {
      token: tokenVal,
      expiresAt: null,
      user: null,
      tenants: [],
      selectedTenant: null
    };
  }

  const cleanToken = typeof token === "string" && token.toLowerCase().startsWith("bearer ")
    ? token.slice(7).trim()
    : token;

  const user = normalizeUser(payload.user || payload.profile || payload.account);
  const rawTenants = payload.tenants || payload.companies || payload.allowedTenants;
  const tenants = normalizeTenantList(rawTenants);
  const selectedTenant = payload.selectedTenant || payload.tenant || payload.currentTenant || tenants[0] || null;

  let expiresAt = null;
  const expiresAtVal = payload.expiresAt || payload.expires_at || payload.expiration || payload.expiresIn;
  const expiresInMinutes = payload.expiresInMinutes || payload.expires_in_minutes;
  if (expiresAtVal) {
    const parsed = typeof expiresAtVal === "number" ? expiresAtVal : Date.parse(expiresAtVal);
    expiresAt = Number.isFinite(parsed) ? parsed : null;
  } else if (typeof expiresInMinutes === "number") {
    expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  }

  return {
    token: cleanToken,
    expiresAt,
    user,
    tenants,
    selectedTenant
  };
}
