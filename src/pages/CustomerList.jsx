import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTrash,
  faPen,
  faSpinner,
  faStar,
  faTimes,
  faUserFriends,
  faTags,
  faCheckCircle,
  faExclamationCircle,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faIdCard
} from "@fortawesome/free-solid-svg-icons";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerCategories,
  createCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
  setDefaultCustomerCategory,
  unsetDefaultCustomerCategory
} from "../api/customerApi";

function CustomerList() {
  const [activeTab, setActiveTab] = useState("clients");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Storage states
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Customer Modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    categoryId: ""
  });

  // Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    isDefault: false
  });

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [custList, catList] = await Promise.all([getCustomers(), getCustomerCategories()]);
      setCustomers(custList || []);
      setCategories(catList || []);
    } catch (err) {
      setError(err.message || "Failed to load directory details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-hide alerts
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Customer submit handler
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!customerForm.name.trim()) {
      setError("Client name is required.");
      return;
    }

    setSubmittingCustomer(true);
    try {
      const payload = {
        name: customerForm.name.trim(),
        email: customerForm.email.trim() || undefined,
        phone: customerForm.phone.trim() || undefined,
        address: customerForm.address.trim() || undefined,
        taxId: customerForm.taxId.trim() || undefined,
        categoryId: customerForm.categoryId ? Number(customerForm.categoryId) : undefined
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
        setSuccess(`Client "${payload.name}" updated successfully!`);
      } else {
        await createCustomer(payload);
        setSuccess(`Client "${payload.name}" added successfully!`);
      }

      setCustomerForm({ name: "", email: "", phone: "", address: "", taxId: "", categoryId: "" });
      setShowCustomerModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save client details.");
    } finally {
      setSubmittingCustomer(false);
    }
  };

  // Open add/edit client
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    // Auto-select default category if exists
    const defaultCat = categories.find((c) => c.isDefault);
    setCustomerForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      categoryId: defaultCat ? defaultCat.id.toString() : ""
    });
    setShowCustomerModal(true);
  };

  const handleOpenEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setCustomerForm({
      name: cust.name || "",
      email: cust.email || "",
      phone: cust.phone || "",
      address: cust.address || "",
      taxId: cust.taxId || "",
      categoryId: cust.category?.id ? cust.category.id.toString() : ""
    });
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = async (cust) => {
    if (!window.confirm(`Are you sure you want to delete client "${cust.name}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteCustomer(cust.id);
      setSuccess(`Client "${cust.name}" deleted successfully!`);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete client.");
    }
  };

  // Category handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!categoryForm.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmittingCategory(true);
    try {
      if (editingCategory) {
        // Step 1: Update name and description
        await updateCustomerCategory(editingCategory.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined
        });

        // Step 2: Handle changes to the isDefault flag
        if (categoryForm.isDefault !== editingCategory.isDefault) {
          if (categoryForm.isDefault) {
            await setDefaultCustomerCategory(editingCategory.id);
          } else {
            await unsetDefaultCustomerCategory(editingCategory.id);
          }
        }
        setSuccess(`Category "${categoryForm.name}" updated successfully!`);
      } else {
        // On creation, pass isDefault directly in create request
        await createCustomerCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          isDefault: categoryForm.isDefault
        });
        setSuccess(`Category "${categoryForm.name}" added successfully!`);
      }

      setCategoryForm({ name: "", description: "", isDefault: false });
      setShowCategoryModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save category details.");
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", isDefault: false });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name || "", description: cat.description || "", isDefault: cat.isDefault || false });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"? Clients belonging to it will lose their category association.`)) return;
    setError("");
    setSuccess("");
    try {
      await deleteCustomerCategory(cat.id);
      setSuccess(`Category "${cat.name}" deleted successfully!`);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete category.");
    }
  };

  // Filters search list
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "" || cust.category?.id === Number(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-sky-500" />
        <p className="mt-3 text-sm">Loading directories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">Manage customer accounts, tax registrations, and customer categories.</p>
        </div>

        <div className="flex gap-2">
          {activeTab === "clients" ? (
            <button
              type="button"
              onClick={handleOpenAddCustomer}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
              <span>Add Client</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Alerts */}
      {error && (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-rose-400 hover:text-rose-600 transition p-1"
            title="Dismiss error"
          >
            <FontAwesomeIcon icon={faTimes} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-emerald-400 hover:text-emerald-600 transition p-1"
            title="Dismiss notification"
          >
            <FontAwesomeIcon icon={faTimes} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
            activeTab === "clients"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FontAwesomeIcon icon={faUserFriends} className="h-4 w-4" />
          <span>Client Directory</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
            activeTab === "categories"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FontAwesomeIcon icon={faTags} className="h-4 w-4" />
          <span>Client Categories</span>
        </button>
      </div>

      {/* CLIENTS TAB VIEW */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-500"
              />
            </div>
            <div className="w-full sm:w-56">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table display */}
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white p-6">
              <FontAwesomeIcon icon={faUserFriends} className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-semibold">No clients match your filter criteria.</p>
              <button
                type="button"
                onClick={handleOpenAddCustomer}
                className="mt-4 text-xs font-bold text-sky-600 hover:text-sky-700 underline"
              >
                Create a new client account
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xxs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Tax ID / ICE</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{cust.name}</td>
                      <td className="px-6 py-4 text-slate-600 space-y-1">
                        {cust.email && (
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                        {cust.phone && (
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {cust.address ? (
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{cust.address}</span>
                          </div>
                        ) : (
                          <span className="italic text-slate-300">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {cust.taxId ? (
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faIdCard} className="h-3 w-3 text-slate-400" />
                            <span>{cust.taxId}</span>
                          </div>
                        ) : (
                          <span className="italic text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const clientCat = categories.find((c) => c.id === cust.categoryId);
                          if (!clientCat) return <span className="text-xxs text-slate-300 italic">None</span>;
                          return (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xxs font-semibold ${
                                clientCat.isDefault
                                  ? "bg-sky-50 text-sky-700 border border-sky-100"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {clientCat.name}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustomer(cust)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition"
                            title="Edit Client"
                          >
                            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(cust)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-rose-50 text-rose-600 transition"
                            title="Delete Client"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES TAB VIEW */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white p-6">
              <FontAwesomeIcon icon={faTags} className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-semibold">No client categories defined.</p>
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="mt-4 text-xs font-bold text-sky-600 hover:text-sky-700 underline"
              >
                Create a client category profile
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xxs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Client Count</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className={`transition ${cat.isDefault ? "bg-sky-50/20 border-l-2 border-l-sky-500" : "hover:bg-slate-50/30"}`}>
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <span>{cat.name}</span>
                        {cat.isDefault && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-50 border border-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-700 shadow-sm" title="Default Category">
                            <FontAwesomeIcon icon={faStar} className="h-2 w-2" />
                            <span>Default</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-sm truncate">
                        {cat.description || <span className="italic text-slate-300">No description</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-600">
                        {customers.filter((c) => c.categoryId === cat.id).length}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition"
                            title="Edit Category"
                          >
                            <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                          </button>
                          {(() => {
                            const catClientCount = customers.filter((c) => c.categoryId === cat.id).length;
                            const isDeletable = !cat.isDefault && catClientCount === 0;
                            return (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                disabled={!isDeletable}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                  isDeletable
                                    ? "hover:bg-rose-50 text-rose-600"
                                    : "text-slate-300 cursor-not-allowed opacity-50"
                                }`}
                                title={
                                  cat.isDefault
                                    ? "Default category cannot be deleted"
                                    : catClientCount > 0
                                    ? "Category has registered clients and cannot be deleted"
                                    : "Delete Category"
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMER FORM MODAL OVERLAY */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCustomer ? "Edit Client Profile" : "Add New Client"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="cust_name" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                    Client Name
                  </label>
                  <input
                    id="cust_name"
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="e.g. ACME Corp or John Doe"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="cust_email" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <input
                    id="cust_email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="billing@acme.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="cust_phone" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </label>
                  <input
                    id="cust_phone"
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="+212600000000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="cust_address" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                    Billing Address
                  </label>
                  <textarea
                    id="cust_address"
                    rows={2}
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="123 Corporate Blvd, Sector 5..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="cust_tax" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                    Tax ID / ICE
                  </label>
                  <input
                    id="cust_tax"
                    type="text"
                    value={customerForm.taxId}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                    placeholder="ICE number"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="cust_cat" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                    Client Category
                  </label>
                  <select
                    id="cust_cat"
                    value={customerForm.categoryId}
                    onChange={(e) => setCustomerForm({ ...customerForm, categoryId: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 outline-none transition focus:border-sky-500 focus:bg-white"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustomer}
                  className="flex-1 rounded-2xl bg-sky-600 py-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
                >
                  {submittingCustomer ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCustomer ? "Update Client" : "Add Client"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY FORM MODAL OVERLAY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? "Edit Category Details" : "Add Client Category"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="cat_name" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                  Category Name
                </label>
                <input
                  id="cat_name"
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. VIP Corporate, Standard Individual"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="cat_desc" className="text-xxs font-bold uppercase tracking-wider text-slate-400">
                  Description
                </label>
                <textarea
                  id="cat_desc"
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Summarize this category classification guidelines..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="cat_is_default"
                  type="checkbox"
                  checked={categoryForm.isDefault}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="cat_is_default" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Set as default client category
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCategory}
                  className="flex-1 rounded-2xl bg-sky-600 py-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
                >
                  {submittingCategory ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Update Category" : "Add Category"}</span>
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

export default CustomerList;
