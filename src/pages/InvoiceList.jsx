import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTrash,
  faEye,
  faFileInvoice,
  faSpinner,
  faFilter,
  faCheckCircle,
  faClock,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { getInvoices, deleteInvoice } from "../api/invoiceApi";
import { formatCurrency } from "../utils";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = [
  // ... existing option array details ...
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PRINTED", label: "Printed" },
  { value: "SOLD", label: "Sold" },
  { value: "FINAL", label: "Final" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "CANCELLED", label: "Cancelled" }
];

function InvoiceList() {
  const { selectedExercice } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    fromDate: "",
    toDate: "",
    page: 0,
    size: 15
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    hasNext: false
  });
  const [deletingId, setDeletingId] = useState(null);

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0
  });

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getInvoices({
        status: filters.status || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        exerciceId: selectedExercice?.id || undefined,
        page: filters.page,
        size: filters.size
      });

      const list = response.content || [];
      setInvoices(list);
      setPagination({
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false
      });

      // Compute statistics based on the full list of loaded invoices
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
    } catch (err) {
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters.status, filters.fromDate, filters.toDate, filters.page, selectedExercice?.id]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 0 // Reset to page 0 on filter change
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteInvoice(id);
      await fetchInvoices();
    } catch (err) {
      alert(err.message || "Failed to delete invoice.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "PRINTED":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "SOLD":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FINAL":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "ARCHIVED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800";
      case "PARTIAL":
        return "bg-amber-100 text-amber-800";
      case "UNPAID":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">Create, track, and manage billing for all your clients.</p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Invoiced</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalInvoiced)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Collected</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(metrics.totalPaid)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">Outstanding Balance</div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{formatCurrency(metrics.totalOutstanding)}</div>
        </div>
      </div>

      {/* Filter and Table Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Filter by Status</label>
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
            <p className="mt-3 text-sm">Fetching invoices...</p>
          </div>
        ) : error ? (
          <div className="my-10 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-sm text-rose-600">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <FontAwesomeIcon icon={faFileInvoice} className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No invoices found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or create a new invoice.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Invoice #</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Issue Date</th>
                  <th className="pb-3 pr-4">Due Date</th>
                  <th className="pb-3 pr-4 text-right">Total Amount</th>
                  <th className="pb-3 pr-4 text-center">Status</th>
                  <th className="pb-3 pr-4 text-center">Payment</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => {
                  const invoiceTotal = (Number(invoice.paidAmount) || 0) + (Number(invoice.remainingAmount) || 0);

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/50">
                      <td className="py-4 pr-4 font-semibold text-slate-900">
                        {invoice.formattedNumber || `#${invoice.invoiceNumber}`}
                      </td>
                      <td className="py-4 pr-4 text-slate-700">
                        {invoice.customer?.name || "Inline Customer"}
                      </td>
                      <td className="py-4 pr-4 text-slate-500">
                        {invoice.invoiceDate}
                      </td>
                      <td className="py-4 pr-4 text-slate-500">
                        {invoice.dueDate || "-"}
                      </td>
                      <td className="py-4 pr-4 text-right font-semibold text-slate-800">
                        {formatCurrency(invoiceTotal)}
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getPaymentStatusBadgeClass(invoice.paymentStatus)}`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-800 disabled:opacity-50"
                            title="Delete Invoice"
                          >
                            {deletingId === invoice.id ? (
                              <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              disabled={filters.page === 0}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {filters.page + 1} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;
