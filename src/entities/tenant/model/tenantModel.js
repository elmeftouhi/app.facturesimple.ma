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
