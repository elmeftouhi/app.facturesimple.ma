import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { isSelectedTenant } from "../model/tenantModel";

function TenantSelector({
  tenantMenuRef,
  tenantMenuOpen,
  selectedTenant,
  tenants,
  switchingTenant,
  onToggle,
  onSelect,
  onCreateNewCompany
}) {
  if (!tenants.length) {
    return null;
  }

  return (
    <div className="relative" ref={tenantMenuRef}>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
      >
        <FontAwesomeIcon icon={faBuilding} className="h-3.5 w-3.5 text-slate-600" />
        <span>{selectedTenant?.name || "Select Tenant"}</span>
        <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-slate-500" />
      </button>

      {tenantMenuOpen ? (
        <div className="absolute left-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          {tenants.map((tenant) => {
            const isSelected = isSelectedTenant(selectedTenant, tenant);

            if (isSelected) {
              return (
                <div
                  key={tenant.id || tenant.name}
                  className="w-full rounded-2xl bg-sky-100 px-3 py-2 text-left text-sm font-semibold text-sky-900"
                >
                  {tenant.name}
                </div>
              );
            }

            return (
              <button
                key={tenant.id || tenant.name}
                type="button"
                onClick={() => onSelect(tenant)}
                className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
              >
                {tenant.name} {switchingTenant ? "(Switching...)" : ""}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onCreateNewCompany}
            className="mt-2 flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-left text-sm font-medium text-sky-700 transition hover:bg-sky-50"
          >
            <span className="text-base">+</span>
            <span>Add new company</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default TenantSelector;
