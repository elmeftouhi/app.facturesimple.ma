import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import TenantSelector from "../components/TenantSelector";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [switchingTenant, setSwitchingTenant] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const [tenantList, setTenantList] = useState([]);
  const tenantMenuRef = useRef(null);
  const { auth, logout, selectTenant, refreshUser, refreshTenants } = useAuth();

  const userName =
    auth?.user?.firstName || auth?.user?.lastName || auth?.user?.email || "Account";
  const selectedTenant = auth?.selectedTenant;
  const tenants = tenantList;

  useEffect(() => {
    setTenantList(auth?.tenants || []);
  }, [auth?.tenants]);

  useEffect(() => {
    if (!tenantMenuOpen) return;

    const handleClickOutside = (event) => {
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target)) {
        setTenantMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tenantMenuOpen]);

  const handleToggle = async () => {
    const willOpen = !menuOpen;
    setMenuOpen(willOpen);
    if (willOpen && refreshUser) {
      setRefreshingUser(true);
      try {
        await refreshUser();
      } catch (err) {
        console.error(err);
      } finally {
        setRefreshingUser(false);
      }
    }
  };

  const handleTenantToggle = async () => {
    if (tenantMenuOpen) {
      setTenantMenuOpen(false);
      return;
    }

    if (!auth) return;

    try {
      const tenantsList = await refreshTenants();
      setTenantList(tenantsList);
      setTenantMenuOpen(true);
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    }
  };

  const handleSelectTenant = (tenant) => {
    setSwitchingTenant(true);
    Promise.resolve(selectTenant(tenant))
      .catch((err) => console.error(err))
      .finally(() => {
        setSwitchingTenant(false);
        setTenantMenuOpen(false);
      });
  };

  const handleCreateNewCompany = () => {
    setTenantMenuOpen(false);
    console.info("Create new company action placeholder");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setMenuOpen(false);
    await logout();
    setLoggingOut(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 py-5 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-slate-900">Facture Simple</span>

          <TenantSelector
            tenantMenuRef={tenantMenuRef}
            tenantMenuOpen={tenantMenuOpen}
            selectedTenant={selectedTenant}
            tenants={tenants}
            switchingTenant={switchingTenant}
            onToggle={handleTenantToggle}
            onSelect={handleSelectTenant}
            onCreateNewCompany={handleCreateNewCompany}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={handleToggle}
            disabled={loggingOut}
            className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-slate-700" />
            <span>{userName}</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              <div className="mb-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                Signed in as
                <div className="font-semibold text-slate-900">{userName}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
