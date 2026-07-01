import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFileInvoice,
  faUserFriends,
  faTimes,
  faLayerGroup,
  faCog
} from "@fortawesome/free-solid-svg-icons";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: faChartLine },
  { path: "/invoices", label: "Invoices", icon: faFileInvoice },
  { path: "/clients", label: "Clients", icon: faUserFriends },
  { path: "/settings", label: "Settings", icon: faCog }
];

function Sidebar({ open, onClose }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open ? (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs transition-opacity md:hidden print:hidden"
        />
      ) : null}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform duration-300 print:hidden md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
              <FontAwesomeIcon icon={faLayerGroup} className="h-4.5 w-4.5" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-900">Facture Simple</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 md:hidden"
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);

            if (item.isPlaceholder) {
              return (
                <div
                  key={item.path}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400"
                  title="Coming soon"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xxs font-medium border border-slate-100">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className={`h-4 w-4 ${active ? "text-sky-600" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
