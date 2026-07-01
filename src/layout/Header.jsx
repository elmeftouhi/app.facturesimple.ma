import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";
import { getCompany, updateCompany } from "../api/companyApi";
import TenantSelector from "../components/TenantSelector";
import ExerciceSelector from "../components/ExerciceSelector";

const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇲🇦" }
];

function LanguageSelector({ auth }) {
  const { i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const currentLang = languages.find((l) => l.code === (i18n.language || "fr").substring(0, 2)) || languages[0];

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langMenuOpen]);

  const handleLangChange = async (code) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
    
    if (auth?.selectedTenant) {
      try {
        const company = await getCompany();
        if (company) {
          await updateCompany({
            ...company,
            language: code
          });
        }
      } catch (err) {
        console.error("Failed to persist company language setting:", err);
      }
    }
  };

  return (
    <div className="relative" ref={langMenuRef}>
      <button
        type="button"
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline font-bold uppercase text-xs tracking-wider text-slate-600">{currentLang.code}</span>
      </button>

      {langMenuOpen && (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-3 duration-150">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLangChange(l.code)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                i18n.language?.startsWith(l.code) ? "bg-sky-50/50 font-semibold text-sky-600" : "text-slate-700"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [switchingTenant, setSwitchingTenant] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const [tenantList, setTenantList] = useState([]);
  const tenantMenuRef = useRef(null);
  const { auth, logout, selectTenant, refreshUser, refreshTenants } = useAuth();

  useEffect(() => {
    if (!auth?.selectedTenant) return;
    const fetchCompanyLang = async () => {
      try {
        const company = await getCompany();
        if (company && company.language) {
          i18n.changeLanguage(company.language.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to load company language preference:", err);
      }
    };
    fetchCompanyLang();
  }, [auth?.selectedTenant?.id]);

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
      .then(() => {
        navigate("/dashboard");
      })
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
    <header className="border-b border-slate-200 bg-white/90 py-5 shadow-sm backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu (visible on mobile only) */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>

          {/* Logo (visible on mobile, hidden on desktop sidebar layout) */}
          <span className="text-lg font-semibold text-slate-900 md:hidden">Facture Simple</span>

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
          <ExerciceSelector />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector auth={auth} />

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
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Profile
                </Link>
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
      </div>
    </header>
  );
}

export default Header;
