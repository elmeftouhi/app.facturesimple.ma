import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faPrint,
  faDollarSign,
  faTrash,
  faHistory,
  faPlus,
  faCheckCircle,
  faClock,
  faBan,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import {
  getInvoice,
  updateInvoiceStatus,
  getInvoiceStatusHistory,
  addInvoicePayment,
  deleteInvoicePayment
} from "../api/invoiceApi";
import { formatCurrency } from "../utils";

const STATUS_FLOW = ["DRAFT", "PRINTED", "FINAL", "SOLD", "ARCHIVED", "CANCELLED"];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CHECK", label: "Check" },
  { value: "TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Credit Card" },
  { value: "OTHER", label: "Other" }
];

function InvoiceDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem("facture-simple-default-template") || "modern";
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "CASH",
    paymentReference: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paidAmount: ""
  });

  const loadInvoiceData = async () => {
    try {
      const data = await getInvoice(id);
      setInvoice(data);
      setPaymentForm((prev) => ({
        ...prev,
        paidAmount: data.remainingAmount ? data.remainingAmount.toString() : ""
      }));

      // Fetch history log
      const history = await getInvoiceStatusHistory(id);
      setStatusHistory(history || []);
    } catch (err) {
      setError(err.message || "Failed to load invoice details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoiceData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateInvoiceStatus(id, newStatus);
      await loadInvoiceData();
    } catch (err) {
      alert(err.message || "Failed to update invoice status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.paidAmount || Number(paymentForm.paidAmount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setRecordingPayment(true);
    try {
      await addInvoicePayment(id, {
        paymentMethod: paymentForm.paymentMethod,
        paymentReference: paymentForm.paymentReference.trim() || undefined,
        paymentDate: paymentForm.paymentDate,
        paidAmount: Number(paymentForm.paidAmount)
      });
      setShowPaymentModal(false);
      setPaymentForm({
        paymentMethod: "CASH",
        paymentReference: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paidAmount: ""
      });
      await loadInvoiceData();
    } catch (err) {
      alert(err.message || "Failed to record payment.");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to remove this payment?")) {
      return;
    }

    setDeletingPaymentId(paymentId);
    try {
      await deleteInvoicePayment(id, paymentId);
      await loadInvoiceData();
    } catch (err) {
      alert(err.message || "Failed to delete payment.");
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
        <p className="mt-3 text-sm">{t("common.loading", "Loading...")}</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-sm text-rose-600">
          {error || "Invoice not found."}
        </div>
        <div className="text-center">
          <Link to="/invoices" className="text-sm font-semibold text-sky-600 hover:underline">
            {t("invoice.back_to_list")}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = (invoice.lineItems || []).reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unitPrice));
  }, 0);
  const vatAmount = subtotal * (Number(invoice.vatRate) / 100);
  const invoiceTotal = subtotal + vatAmount;

  const getStatusColor = (status) => {
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500 text-white";
      case "PARTIAL":
        return "bg-amber-500 text-white";
      case "UNPAID":
        return "bg-rose-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Buttons - hidden during print */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t("invoice.details")}: {invoice.formattedNumber || `#${invoice.invoiceNumber}`}
            </h1>
            <p className="text-xs text-slate-500">{t("invoice.details_subtitle")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faPrint} className="h-3.5 w-3.5" />
            <span>{t("invoice.print")}</span>
          </button>
          
          {invoice.remainingAmount > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FontAwesomeIcon icon={faDollarSign} className="h-3.5 w-3.5" />
              <span>{t("invoice.record_payment")}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Printable Invoice Details */}
        <div className="lg:col-span-2 space-y-6 print:w-full print:border-none print:shadow-none">
          {/* Main Invoice Bill Sheet */}
        {/* Template Switcher Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("invoice.template_layout")}:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500"
            >
              <option value="modern">{t("invoice.modern_template")}</option>
              <option value="classic">{t("invoice.classic_template")}</option>
              <option value="elegant">{t("invoice.elegant_template")}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("facture-simple-default-template", selectedTemplate);
              alert(`"${selectedTemplate.toUpperCase()}" template set as default layout!`);
            }}
            className="text-xxs font-bold uppercase tracking-wider text-sky-600 hover:text-sky-700 transition px-3 py-1.5 rounded-xl hover:bg-sky-50 border border-transparent hover:border-sky-100"
          >
            {t("invoice.set_as_default")}
          </button>
        </div>

        {(() => {
          const isClassic = selectedTemplate === "classic";
          const isElegant = selectedTemplate === "elegant";
          const isModern = selectedTemplate === "modern";

          return (
            <div className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none ${
              isElegant ? "font-serif text-slate-900" : "font-sans text-slate-800"
            }`}>
              {/* Top Identity Block */}
              <div className={`flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b ${
                isClassic
                  ? "bg-slate-800 text-white p-6 -mx-8 -mt-8 rounded-t-3xl border-slate-700 pb-6"
                  : isElegant
                  ? "border-double border-b-4 border-slate-200 pb-8"
                  : "border-slate-100 pb-8"
              }`}>
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    isClassic ? "text-slate-300" : isElegant ? "text-slate-500 italic" : "text-sky-600"
                  }`}>
                    {t("invoice.details")}
                  </span>
                  <h2 className={`mt-1 text-3xl font-black ${isClassic ? "text-white" : "text-slate-900"}`}>
                    {invoice.formattedNumber || `#${invoice.invoiceNumber}`}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 print:mt-2">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                      {invoice.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Company Details */}
                <div className={`text-left md:text-right text-sm space-y-1 ${isClassic ? "text-slate-200" : "text-slate-800"}`}>
                  {invoice.company?.logo && (
                    <div className="mb-2 md:flex md:justify-end">
                      <img
                        src={invoice.company.logo}
                        alt={`${invoice.company.name} Logo`}
                        className={`h-12 w-auto object-contain ${
                          isClassic ? "bg-white p-1.5 rounded-lg shadow-sm" : ""
                        }`}
                      />
                    </div>
                  )}
                  <div className={`font-bold ${isClassic ? "text-white" : "text-slate-900"}`}>
                    {invoice.company?.name || "Facture Simple Tenant"}
                  </div>
                  {invoice.company?.email && <div className={isClassic ? "text-slate-300" : "text-slate-500"}>{invoice.company.email}</div>}
                  {invoice.company?.phone && <div className={isClassic ? "text-slate-300" : "text-slate-500"}>{invoice.company.phone}</div>}
                  {invoice.company?.address && (
                    <div className={`max-w-xs md:ml-auto ${isClassic ? "text-slate-300" : "text-slate-500"}`}>
                      {invoice.company.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill Info Block */}
              <div className="grid gap-6 sm:grid-cols-2 text-sm">
                {/* Customer */}
                <div className={`${
                  isClassic
                    ? "rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs"
                    : isElegant
                    ? "border-b border-slate-100 pb-4"
                    : "rounded-2xl border border-slate-100 p-4"
                }`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isElegant ? "text-slate-400 italic" : "text-slate-400"}`}>
                    {t("invoice.billed_to")}
                  </span>
                  <div className="mt-2 font-bold text-slate-900">{invoice.customer?.name || "Inline Customer"}</div>
                  {invoice.customer?.email && <div className="mt-1 text-slate-500">{invoice.customer.email}</div>}
                  {invoice.customer?.phone && <div className="text-slate-500">{invoice.customer.phone}</div>}
                  {invoice.customer?.address && <div className="mt-2 text-slate-500 whitespace-pre-line">{invoice.customer.address}</div>}
                  {invoice.customer?.taxId && <div className="mt-2 text-xs font-semibold text-slate-500">ICE / Tax ID: {invoice.customer.taxId}</div>}
                </div>

                {/* Invoice Meta */}
                <div className={`${
                  isClassic
                    ? "rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs space-y-3"
                    : isElegant
                    ? "border-b border-slate-100 pb-4 space-y-3"
                    : "rounded-2xl border border-slate-100 p-4 space-y-3"
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("invoice.date")}:</span>
                    <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("invoice.due_date")}:</span>
                      <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
                    </div>
                  )}
                  {invoice.description && (
                    <div className={`pt-3 ${isElegant ? "border-t border-dashed border-slate-200" : "border-t border-slate-100"}`}>
                      <span className={`block text-xs font-semibold uppercase tracking-wider ${isElegant ? "text-slate-400 italic" : "text-slate-400"}`}>
                        {t("invoice.memo")}
                      </span>
                      <p className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">{invoice.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className={`text-xs font-semibold uppercase tracking-wider text-slate-400 ${
                      isClassic
                        ? "border border-slate-200 bg-slate-100 text-slate-700"
                        : isElegant
                        ? "border-t-2 border-b-2 border-double border-slate-300 text-slate-600"
                        : "border-b border-slate-200"
                    }`}>
                      <th className={`pb-3 pr-4 ${isClassic ? "p-3" : isElegant ? "py-2.5" : ""}`}>{t("invoice.item_description")}</th>
                      <th className={`pb-3 pr-4 text-center ${isClassic ? "p-3" : isElegant ? "py-2.5" : ""}`}>{t("invoice.qty")}</th>
                      <th className={`pb-3 pr-4 text-right ${isClassic ? "p-3" : isElegant ? "py-2.5" : ""}`}>{t("invoice.price")}</th>
                      <th className={`pb-3 text-right ${isClassic ? "p-3" : isElegant ? "py-2.5" : ""}`}>{t("invoice.line_total")}</th>
                    </tr>
                  </thead>
                  <tbody className={isClassic ? "divide-y divide-slate-200 border-l border-r border-b border-slate-200" : "divide-y divide-slate-100"}>
                    {(invoice.lineItems || []).map((item, index) => {
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.unitPrice) || 0;
                      const lineTotal = qty * price;

                      return (
                        <tr key={item.id || index} className={isClassic && index % 2 === 1 ? "bg-slate-50/50" : ""}>
                          <td className={`py-4 pr-4 ${isClassic ? "p-3" : ""}`}>
                            <div className="font-semibold text-slate-800">{item.itemReference}</div>
                            {item.itemDescription && <div className="text-xs text-slate-400 mt-0.5 whitespace-pre-wrap">{item.itemDescription}</div>}
                          </td>
                          <td className={`py-4 pr-4 text-center text-slate-700 ${isClassic ? "p-3" : ""}`}>{qty}</td>
                          <td className={`py-4 pr-4 text-right text-slate-700 ${isClassic ? "p-3" : ""}`}>{formatCurrency(price)}</td>
                          <td className={`py-4 text-right font-semibold text-slate-800 ${isClassic ? "p-3" : ""}`}>{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculations and Balances */}
              <div className={`flex flex-col items-end pt-6 ${
                isElegant ? "border-t-2 border-double border-slate-300" : "border-t border-slate-100"
              }`}>
                <div className="w-full max-w-sm text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("invoice.subtotal")}:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("invoice.vat")} ({invoice.vatRate}%):</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className={`flex justify-between border-t pt-3 text-base font-bold ${
                    isElegant
                      ? "border-double border-t-4 border-slate-300 text-slate-900"
                      : isClassic
                      ? "border-slate-200 text-slate-900"
                      : "border-slate-100 text-sky-600"
                  }`}>
                    <span className={isElegant ? "font-black" : "text-slate-900"}>{t("invoice.total")}:</span>
                    <span className={isModern ? "text-sky-600" : "text-slate-900"}>{formatCurrency(invoiceTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{t("invoice.collected_amount")}:</span>
                    <span>{formatCurrency(Number(invoice.paidAmount) || 0)}</span>
                  </div>
                  <div className={`flex justify-between border-t border-dashed pt-2 text-sm font-bold ${
                    isClassic ? "border-slate-200 text-rose-700 bg-rose-50/50 p-2.5 rounded-xl mt-1" : "border-slate-100 text-rose-600"
                  }`}>
                    <span>{t("invoice.remaining")}:</span>
                    <span>{formatCurrency(Number(invoice.remainingAmount) || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

          {/* Payments List Block (always shown, hidden from printing if empty) */}
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print:border-none print:shadow-none">
              <h3 className="text-lg font-bold text-slate-900 print:text-base">{t("invoice.payments_history")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2">{t("invoice.date", "Date")}</th>
                      <th className="pb-2">{t("invoice.payment_method_label", "Method")}</th>
                      <th className="pb-2">{t("invoice.payment_reference_label", "Reference")}</th>
                      <th className="pb-2 text-right">{t("invoice.amount")}</th>
                      <th className="pb-2 text-center print:hidden">{t("invoice.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoice.payments.map((pmt) => (
                      <tr key={pmt.id}>
                        <td className="py-3 text-slate-600">{pmt.paymentDate}</td>
                        <td className="py-3 text-slate-700 font-medium">
                          {PAYMENT_METHODS.find((m) => m.value === pmt.paymentMethod)?.label || pmt.paymentMethod}
                        </td>
                        <td className="py-3 text-slate-400">{pmt.paymentReference || "-"}</td>
                        <td className="py-3 text-right font-semibold text-slate-800">{formatCurrency(pmt.paidAmount)}</td>
                        <td className="py-3 text-center print:hidden">
                          <button
                            onClick={() => handleDeletePayment(pmt.id)}
                            disabled={deletingPaymentId === pmt.id}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                            title="Remove Payment"
                          >
                            {deletingPaymentId === pmt.id ? (
                              <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar Info - Hidden during print */}
        <div className="space-y-6 print:hidden">
          {/* Status Administration */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{t("invoice.manage_status")}</h3>
            <div className="text-sm text-slate-500">
              {t("invoice.manage_status_desc", "Update the lifecycle state of this invoice to transition stages.")}
            </div>

            <div className="grid gap-2">
              {STATUS_FLOW.map((state) => {
                const isCurrent = invoice.status === state;

                return (
                  <button
                    key={state}
                    type="button"
                    disabled={isCurrent || updatingStatus}
                    onClick={() => handleStatusChange(state)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                      isCurrent
                        ? "bg-slate-50 text-slate-900 border-slate-300 font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{state}</span>
                    {isCurrent && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Change Log log */}
          {statusHistory.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faHistory} className="text-slate-400 h-4.5 w-4.5" />
                <span>{t("invoice.audit_history")}</span>
              </h3>

              <div className="flow-root">
                <ul className="-mb-8 text-xs">
                  {statusHistory.map((log, index) => (
                    <li key={log.id || index}>
                      <div className="relative pb-8">
                        {index !== statusHistory.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1 flex flex-col sm:flex-row sm:justify-between gap-1">
                            <div>
                              <p className="text-slate-700">
                                {t("invoice.changed_from", "Changed from")} <span className="font-semibold text-slate-500">{log.oldStatus}</span> {t("invoice.to_status", "to")}{" "}
                                <span className="font-bold text-slate-900">{log.newStatus}</span>
                              </p>
                              {log.createdBy && (
                                <p className="text-slate-400 text-xxs mt-0.5">
                                  {t("invoice.changed_by", "by")} <span className="font-medium text-slate-500">{log.createdBy}</span>
                                </p>
                              )}
                            </div>
                            <div className="text-left sm:text-right text-slate-400 whitespace-nowrap text-xxs pt-0.5">
                              <time>
                                {new Date(log.changedAt).toLocaleDateString()} at{" "}
                                {new Date(log.changedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Dialog Modal (Print Hidden) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 print:hidden">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{t("invoice.record_payment_title")}</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4 text-sm">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("invoice.payment_date_label")} *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("invoice.payment_method_label")} *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("invoice.paid_amount_label")} ({invoice.company?.currency || "MAD"}) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="0.00"
                  value={paymentForm.paidAmount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white font-bold"
                />
                <span className="mt-1 block text-xxs text-slate-400">
                  {t("invoice.max_remaining")}: {formatCurrency(invoice.remainingAmount)}
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("invoice.payment_reference_label")}</label>
                <input
                  type="text"
                  placeholder={t("invoice.payment_reference_placeholder", "e.g. Check number, transaction ID")}
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="flex-1 rounded-2xl bg-emerald-600 py-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {recordingPayment ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3 w-3 animate-spin" />
                      <span>{t("common.saving", "Saving...")}</span>
                    </>
                  ) : (
                    <span>{t("invoice.add_payment_btn")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceDetails;
