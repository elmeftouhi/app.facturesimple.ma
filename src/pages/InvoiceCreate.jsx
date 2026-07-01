import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { createInvoice } from "../api/invoiceApi";
import { getCustomers } from "../api/customerApi";

function InvoiceCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Customer selection toggle (true = Select existing, false = Create new)
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);

  // Form State
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [dueDate, setDueDate] = useState("");
  const [vatRate, setVatRate] = useState("20.00");
  const [description, setDescription] = useState("");
  
  // Selected Customer ID
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // New Customer State
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: ""
  });

  // Line Items State
  const [lineItems, setLineItems] = useState([
    { itemReference: "", itemDescription: "", quantity: "1", unitPrice: "0.00" }
  ]);

  // Fetch Customers on mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data || []);
        if (data && data.length > 0) {
          setSelectedCustomerId(data[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoadingCustomers(false);
      }
    }
    loadCustomers();
  }, []);

  // Compute Subtotal, VAT and Grand Total
  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const vatPercent = Number(vatRate) || 0;
  const vatAmount = subtotal * (vatPercent / 100);
  const total = subtotal + vatAmount;

  // Handlers for Line Items
  const handleLineItemChange = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { itemReference: "", itemDescription: "", quantity: "1", unitPrice: "0.00" }
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return; // Keep at least one line item
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Input Validation
      if (useExistingCustomer && !selectedCustomerId) {
        throw new Error("Please select a customer.");
      }
      if (!useExistingCustomer && !newCustomer.name.trim()) {
        throw new Error("Customer name is required for new customer creation.");
      }
      if (!vatRate || Number(vatRate) < 0.01) {
        throw new Error("VAT rate is required and must be greater than 0.");
      }

      const validLineItems = lineItems.filter(item => item.itemReference.trim() !== "");
      if (validLineItems.length === 0) {
        throw new Error("Please add at least one line item with a reference/name.");
      }

      // Format payload
      const payload = {
        invoiceDate,
        dueDate: dueDate || undefined,
        vatRate: Number(vatRate),
        description: description || undefined,
        lineItems: validLineItems.map(item => ({
          itemReference: item.itemReference.trim(),
          itemDescription: item.itemDescription.trim() || undefined,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0
        })),
        payments: []
      };

      if (useExistingCustomer) {
        payload.customerId = Number(selectedCustomerId);
      } else {
        payload.newCustomer = {
          name: newCustomer.name.trim(),
          email: newCustomer.email.trim() || undefined,
          phone: newCustomer.phone.trim() || undefined,
          address: newCustomer.address.trim() || undefined,
          taxId: newCustomer.taxId.trim() || undefined
        };
      }

      await createInvoice(payload);
      navigate("/invoices");
    } catch (err) {
      setError(err.message || "Failed to create invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/invoices"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Invoice</h1>
          <p className="text-sm text-slate-500">Draft a new invoice to collect payment from clients.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Details and Line Items */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Selection */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Customer Details</h2>
              <button
                type="button"
                onClick={() => setUseExistingCustomer(!useExistingCustomer)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                {useExistingCustomer ? "+ Create New Customer" : "Select Existing Customer"}
              </button>
            </div>

            <div className="mt-4">
              {useExistingCustomer ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Select Customer</label>
                  {loadingCustomers ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      <span className="text-sm">Loading customers list...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.email ? `(${c.email})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="e.g. Acme Corporation"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Email Address</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="customer@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Phone Number</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="+212 600-000000"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Billing Address</label>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      placeholder="Billing Address Details"
                      rows={2}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Tax ID / ICE</label>
                    <input
                      type="text"
                      value={newCustomer.taxId}
                      onChange={(e) => setNewCustomer({ ...newCustomer, taxId: e.target.value })}
                      placeholder="ICE or Tax Identification Number"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Line Items</h2>

            <div className="mt-4 space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50/30 p-5 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  {/* Item Header (Index and Action) */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Line Item #{index + 1}</span>
                    <button
                      type="button"
                      disabled={lineItems.length === 1}
                      onClick={() => removeLineItem(index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      title="Delete Line Item"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid gap-4 sm:grid-cols-12">
                    {/* Item Name / Reference */}
                    <div className="sm:col-span-6">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Item / Reference *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Design Consulting"
                        value={item.itemReference}
                        onChange={(e) => handleLineItemChange(index, "itemReference", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Quantity</label>
                      <input
                        type="number"
                        required
                        min="0.001"
                        step="any"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-3">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Unit Price</label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="any"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5"
                      />
                    </div>

                    {/* Description Details (Full Width) */}
                    <div className="sm:col-span-12">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Description / Details</label>
                      <textarea
                        rows={2}
                        placeholder="Provide detailed notes, task specifications, deliverables description, or client notes..."
                        value={item.itemDescription}
                        onChange={(e) => handleLineItemChange(index, "itemDescription", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 resize-y"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLineItem}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50/50 w-full"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              <span>Add Line Item</span>
            </button>
          </div>
        </div>

        {/* Sidebar Info and Totals */}
        <div className="space-y-6">
          {/* General Parameters */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Invoice Settings</h2>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Invoice Date *</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">VAT Rate (%) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Description / Memo</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional invoice note visible to client..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Summary</h2>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">
                  {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">VAT ({vatRate}%)</span>
                <span className="font-semibold text-slate-800">
                  {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(vatAmount)}
                </span>
              </div>
              <div className="flex justify-between py-3.5 text-base font-bold">
                <span className="text-slate-950">Total Amount</span>
                <span className="text-sky-600">
                  {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving Invoice...</span>
                </>
              ) : (
                <span>Save Invoice</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default InvoiceCreate;
