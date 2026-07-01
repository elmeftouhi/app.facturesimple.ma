import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Sidebar from "./layout/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InvoiceList from "./pages/InvoiceList";
import InvoiceCreate from "./pages/InvoiceCreate";
import InvoiceDetails from "./pages/InvoiceDetails";
import CompanySettings from "./pages/CompanySettings";
import UserProfile from "./pages/UserProfile";
import CustomerList from "./pages/CustomerList";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faCheckCircle, faShieldAlt, faCoins } from "@fortawesome/free-solid-svg-icons";

function GlobalProgressBar() {
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const handleStart = () => setActiveRequests((prev) => prev + 1);
    const handleEnd = () => setActiveRequests((prev) => Math.max(0, prev - 1));

    window.addEventListener("api-request-start", handleStart);
    window.addEventListener("api-request-end", handleEnd);

    return () => {
      window.removeEventListener("api-request-start", handleStart);
      window.removeEventListener("api-request-end", handleEnd);
    };
  }, []);

  if (activeRequests === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 w-full overflow-hidden bg-sky-100/30">
      <div className="h-full w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 animate-loading-bar" />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Brand Showcase Hero Panel (hidden on small viewports) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-12 text-white relative overflow-hidden">
        {/* Abstract design elements/glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo/Header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Facture Simple
          </span>
        </div>

        {/* Main Pitch */}
        <div className="my-auto space-y-8 z-10 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Manage your billing with absolute precision.
            </h2>
            <p className="text-sm text-slate-300">
              Generate compliance invoices, split activities into customizable fiscal years, and oversee metrics in real-time.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                <FontAwesomeIcon icon={faCheckCircle} className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Fiscal Year Guard</h4>
                <p className="text-xs text-slate-400">Prevent historical changes by locking finalized Exercices.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                <FontAwesomeIcon icon={faShieldAlt} className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Secure Workspaces</h4>
                <p className="text-xs text-slate-400">Isolate business records securely under dedicated multi-tenant contexts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                <FontAwesomeIcon icon={faCoins} className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Revenue Analytics</h4>
                <p className="text-xs text-slate-400">Instant visibility over collected, draft, and outstanding earnings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xxs text-slate-500 z-10">
          © 2026 Facture Simple. All rights reserved.
        </div>
      </div>

      {/* Right Side: Form Canvas */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 md:px-16 lg:px-20 bg-slate-50">
        <div className="mx-auto w-full max-w-lg space-y-6">
          {/* Mobile Header (hidden on large desktop) */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="h-4 w-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-900">Facture Simple</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedLayout() {
  const { auth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tenantKey = auth?.selectedTenant?.id || auth?.selectedTenant?.name || "default";

  return (
    <ProtectedRoute>
      <div key={tenantKey} className="flex min-h-screen bg-slate-50 text-slate-900">
        {/* Responsive vertical sidebar navigation */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content canvas containing Header, Main view, and Footer */}
        <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
          <Header onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 py-10 md:px-8">
            <div className="mx-auto max-w-5xl">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <GlobalProgressBar />
      <Routes>
        {/* Public Guest Routes */}
        <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
        
        {/* Protected App Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/new" element={<InvoiceCreate />} />
          <Route path="/invoices/:id" element={<InvoiceDetails />} />
          <Route path="/settings" element={<CompanySettings />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/clients" element={<CustomerList />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
