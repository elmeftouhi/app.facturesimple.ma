import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoice,
  faPlus,
  faArrowRight,
  faSpinner,
  faUserFriends,
  faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import { getInvoices } from "../api/invoiceApi";
import { getCustomers } from "../api/customerApi";
import { formatCurrency } from "../utils";

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState(0);

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch last 5 invoices
        const invResponse = await getInvoices({ page: 0, size: 5 });
        setInvoices(invResponse.content || []);

        // Also fetch full invoice metrics from page size
        const allInvResponse = await getInvoices({ page: 0, size: 100 });
        const list = allInvResponse.content || [];
        let invoiced = 0;
        let paid = 0;
        let outstanding = 0;
        list.forEach((inv) => {
          const paidVal = Number(inv.paidAmount) || 0;
          const remainingVal = Number(inv.remainingAmount) || 0;
          invoiced += (paidVal + remainingVal);
          paid += paidVal;
          outstanding += remainingVal;
        });
        setMetrics({
          totalInvoiced: invoiced,
          totalPaid: paid,
          totalOutstanding: outstanding
        });

        // Fetch customers list for stats
        const custData = await getCustomers();
        setCustomerCount(custData?.length || 0);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700";
      case "PRINTED":
        return "bg-sky-100 text-sky-700";
      case "SOLD":
        return "bg-emerald-100 text-emerald-700";
      case "FINAL":
        return "bg-violet-100 text-violet-700";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome to your billing overview sheet.</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white p-6" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <FontAwesomeIcon icon={faCreditCard} className="text-slate-300 h-4.5 w-4.5" />
            </div>
            <div className="mt-4 text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalInvoiced)}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Collected</span>
              <FontAwesomeIcon icon={faCreditCard} className="text-emerald-300 h-4.5 w-4.5" />
            </div>
            <div className="mt-4 text-2xl font-bold text-emerald-600">{formatCurrency(metrics.totalPaid)}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Outstanding</span>
              <FontAwesomeIcon icon={faCreditCard} className="text-rose-300 h-4.5 w-4.5" />
            </div>
            <div className="mt-4 text-2xl font-bold text-rose-600">{formatCurrency(metrics.totalOutstanding)}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Clients</span>
              <FontAwesomeIcon icon={faUserFriends} className="text-slate-300 h-4.5 w-4.5" />
            </div>
            <div className="mt-4 text-2xl font-bold text-slate-900">{customerCount}</div>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Recent Invoices */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Invoices</h2>
            <Link
              to="/invoices"
              className="group flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              <span>View All</span>
              <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <FontAwesomeIcon icon={faFileInvoice} className="h-10 w-10 text-slate-200" />
              <p className="mt-3 text-sm">No invoices recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Client</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv) => {
                    const totalVal = (Number(inv.paidAmount) || 0) + (Number(inv.remainingAmount) || 0);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-3">
                          <Link to={`/invoices/${inv.id}`} className="font-semibold text-slate-900 hover:underline">
                            {inv.formattedNumber || `#${inv.invoiceNumber}`}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-700">{inv.customer?.name || "Inline Customer"}</td>
                        <td className="py-3 text-right font-semibold text-slate-800">{formatCurrency(totalVal)}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xxs font-medium ${getStatusBadgeClass(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Actions & Help */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Billing Quick Actions</h2>
          <div className="grid gap-3">
            <Link
              to="/invoices/new"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Add New Invoice</div>
                <div className="text-xs text-slate-400">Create draft or final invoices</div>
              </div>
            </Link>

            <Link
              to="/invoices"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FontAwesomeIcon icon={faFileInvoice} className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Invoices List</div>
                <div className="text-xs text-slate-400">Search and filter statements</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
