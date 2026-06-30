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
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">{children}</div>
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
