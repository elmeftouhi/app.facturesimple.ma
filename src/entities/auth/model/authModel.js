function getFirstDefined(source, keys) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function normalizeTokenValue(token) {
  if (typeof token !== "string") {
    return undefined;
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }

  return trimmed;
}

function findNestedValue(source, keys) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const direct = getFirstDefined(source, keys);
  if (direct !== undefined) {
    return direct;
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findNestedValue(item, keys);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === "object") {
      const found = findNestedValue(value, keys);
      if (found !== undefined) {
        return found;
      }
    }
  }

  return undefined;
}

function resolvePayload(data) {
  if (!data || typeof data !== "object") {
    return {};
  }

  const candidates = [
    data,
    data.data,
    data.payload,
    data.result,
    data.response,
    data.auth,
    data.session,
    data.body,
    data.details
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const token = findNestedValue(candidate, [
      "token",
      "accessToken",
      "access_token",
      "jwt",
      "jwtToken",
      "idToken",
      "authToken"
    ]);

    if (token) {
      return candidate;
    }
  }

  return data;
}

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

export function buildAuthSession(data) {
  const payload = resolvePayload(data);
  const token = normalizeTokenValue(
    findNestedValue(payload, [
      "token",
      "accessToken",
      "access_token",
      "jwt",
      "jwtToken",
      "idToken",
      "authToken"
    ])
  );
console.log("Saving auth data:", payload); // Debugging line
  if (!token) {
    const headerToken = normalizeTokenValue(
      findNestedValue(data?.headers || {}, ["authorization", "Authorization", "x-auth-token", "x-access-token"])
    );

    if (!headerToken) {
      throw new Error("Missing auth token in response.");
    }

    return {
      token: headerToken,
      expiresAt: null,
      user: null,
      tenants: [],
      selectedTenant: null
    };
  }

  const user = normalizeUser(findNestedValue(payload, ["user", "profile", "account"]));
  const tenants = normalizeTenantList(findNestedValue(payload, ["tenants", "companies", "allowedTenants"]));
  const selectedTenant = findNestedValue(payload, ["selectedTenant", "tenant", "currentTenant", "selectedTenantId"]);
  const expiresInMinutes = getFirstDefined(payload, ["expiresInMinutes", "expires_in_minutes"]);
  const expiresAt = getFirstDefined(payload, ["expiresAt", "expires_at", "expiration", "expiresIn"]);

  return {
    token,
    expiresAt: expiresAt || (typeof expiresInMinutes === "number" ? Date.now() + expiresInMinutes * 60 * 1000 : null),
    user,
    tenants,
    selectedTenant: selectedTenant || tenants?.[0] || null
  };
}
