import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUniversity,
  faCheckCircle,
  faPlus,
  faTrash,
  faSpinner,
  faStar,
  faTimes,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import {
  getCompany,
  createCompany,
  updateCompany,
  addBank,
  updateBank,
  deleteBank,
  setDefaultBank
} from "../api/companyApi";
import ExercicesSettings from "./ExercicesSettings";

const CURRENCIES = [
  { code: "MAD", label: "Moroccan Dirham (MAD)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" }
];

function CompanySettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "company";
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Company Form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    registreCommerce: "",
    logo: "",
    website: "",
    currency: "MAD",
    defaultVatRate: "20.00",
    paymentTermsInDays: 30,
    description: ""
  });

  // Bank accounts list from backend response
  const [banksList, setBanksList] = useState([]);
  
  // Bank Account Modal state
  const [showBankModal, setShowBankModal] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [editingBank, setEditingBank] = useState(null); // holds bank object if editing
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    swiftCode: "",
    iban: "",
    isDefault: false
  });

  // Fetch company details on mount
  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCompany();
      if (data) {
        setExists(true);
        setCompanyForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          taxId: data.taxId || "",
          registreCommerce: data.registreCommerce || "",
          logo: data.logo || "",
          website: data.website || "",
          currency: data.currency || "MAD",
          defaultVatRate: data.defaultVatRate ? data.defaultVatRate.toString() : "20.00",
          paymentTermsInDays: data.paymentTermsInDays ?? 30,
          description: data.description || ""
        });
        setBanksList(data.banks || []);
      } else {
        setExists(false);
      }
    } catch (err) {
      setError(err.message || "Failed to load company settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: companyForm.name.trim(),
        email: companyForm.email.trim() || undefined,
        phone: companyForm.phone.trim() || undefined,
        address: companyForm.address.trim() || undefined,
        taxId: companyForm.taxId.trim() || undefined,
        registreCommerce: companyForm.registreCommerce.trim() || undefined,
        logo: companyForm.logo.trim() || undefined,
        website: companyForm.website.trim() || undefined,
        currency: companyForm.currency,
        defaultVatRate: Number(companyForm.defaultVatRate) || 0,
        paymentTermsInDays: Number(companyForm.paymentTermsInDays) || 30,
        description: companyForm.description.trim() || undefined
      };

      let updatedCompany;
      if (exists) {
        updatedCompany = await updateCompany(payload);
        setSuccess("Company profile updated successfully!");
      } else {
        updatedCompany = await createCompany(payload);
        setExists(true);
        setSuccess("Company profile created successfully!");
      }

      if (updatedCompany) {
        setBanksList(updatedCompany.banks || []);
      }
    } catch (err) {
      setError(err.message || "Failed to save company settings.");
    } finally {
      setSaving(false);
    }
  };

  // Banks handlers
  const handleOpenAddBank = () => {
    setEditingBank(null);
    setBankForm({
      bankName: "",
      accountNumber: "",
      swiftCode: "",
      iban: "",
      isDefault: false
    });
    setShowBankModal(true);
  };

  const handleOpenEditBank = (bank) => {
    setEditingBank(bank);
    setBankForm({
      bankName: bank.bankName || "",
      accountNumber: bank.accountNumber || "",
      swiftCode: bank.swiftCode || "",
      iban: bank.iban || "",
      isDefault: bank.isDefault || false
    });
    setShowBankModal(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankForm.bankName.trim()) {
      alert("Bank name is required.");
      return;
    }

    setSavingBank(true);
    try {
      const payload = {
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim() || undefined,
        swiftCode: bankForm.swiftCode.trim() || undefined,
        iban: bankForm.iban.trim() || undefined,
        isDefault: bankForm.isDefault
      };

      if (editingBank) {
        await updateBank(editingBank.id, payload);
      } else {
        await addBank(payload);
      }
      setShowBankModal(false);
      await fetchDetails();
    } catch (err) {
      alert(err.message || "Failed to save bank information.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm("Are you sure you want to remove this bank account?")) {
      return;
    }
    try {
      await deleteBank(bankId);
      await fetchDetails();
    } catch (err) {
      alert(err.message || "Failed to delete bank.");
    }
  };

  const handleSetDefaultBank = async (bankId) => {
    try {
      await setDefaultBank(bankId);
      await fetchDetails();
    } catch (err) {
      alert(err.message || "Failed to set default bank.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
        <p className="mt-3 text-sm">Loading settings details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Settings</h1>
        <p className="text-sm text-slate-500">Configure your company identity, default VAT rules, and bank details.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeTab === "company"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Company Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("exercices")}
          className={`border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeTab === "exercices"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Fiscal Years (Exercices)
        </button>
      </div>

      {activeTab === "company" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Side: Profile Form */}
          <form onSubmit={handleCompanySubmit} className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-slate-400" />
              <span>Company Information</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Email Address</label>
                <input
                  type="email"
                  placeholder="billing@acme.com"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+212 500-000000"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Company Address</label>
                <textarea
                  placeholder="123 Business Road, Casablanca, Morocco"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Tax ID / ICE</label>
                <input
                  type="text"
                  placeholder="ICE number"
                  value={companyForm.taxId}
                  onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Registre Commerce (RC)</label>
                <input
                  type="text"
                  placeholder="RC number"
                  value={companyForm.registreCommerce}
                  onChange={(e) => setCompanyForm({ ...companyForm, registreCommerce: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Logo Link</label>
                <input
                  type="text"
                  placeholder="URL to logo image"
                  value={companyForm.logo}
                  onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Website URL</label>
                <input
                  type="text"
                  placeholder="https://acme.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 border-t border-slate-100 pt-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Memo Description</label>
                <textarea
                  placeholder="Brief description about company..."
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Billing Preferences</h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Currency *</label>
                <select
                  value={companyForm.currency}
                  onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Default VAT Rate (%) *</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={companyForm.defaultVatRate}
                  onChange={(e) => setCompanyForm({ ...companyForm, defaultVatRate: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Payment Terms (Days) *</label>
                <input
                  type="number"
                  required
                  value={companyForm.paymentTermsInDays}
                  onChange={(e) => setCompanyForm({ ...companyForm, paymentTermsInDays: Number(e.target.value) || 0 })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{exists ? "Save Configuration" : "Initialize Profile"}</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Side: Banks list */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faUniversity} className="text-slate-400" />
                <span>Banks Ledger</span>
              </h2>
              {exists && (
                <button
                  type="button"
                  onClick={handleOpenAddBank}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition hover:bg-sky-100"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {!exists ? (
              <div className="text-center py-6 text-sm text-slate-400 italic">
                Set up your company profile first to add bank options.
              </div>
            ) : banksList.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                No bank accounts linked yet. Click the plus button above to add one.
              </div>
            ) : (
              <div className="space-y-3">
                {banksList.map((bank) => (
                  <div
                    key={bank.id}
                    className={`rounded-2xl border p-4 text-sm relative transition ${
                      bank.isDefault
                        ? "border-sky-200 bg-sky-50/20"
                        : "border-slate-100 bg-slate-50/20"
                    }`}
                  >
                    {bank.isDefault && (
                      <span className="absolute top-4 right-4 text-sky-600" title="Default account">
                        <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                      </span>
                    )}

                    <div className="font-bold text-slate-900 pr-6">{bank.bankName}</div>
                    {bank.accountNumber && (
                      <div className="mt-2 text-slate-600">
                        <span className="text-xs text-slate-400 uppercase font-semibold block">Account #</span>
                        <span>{bank.accountNumber}</span>
                      </div>
                    )}
                    {bank.iban && (
                      <div className="mt-1 text-slate-600">
                        <span className="text-xs text-slate-400 uppercase font-semibold block">IBAN</span>
                        <span>{bank.iban}</span>
                      </div>
                    )}
                    {bank.swiftCode && (
                      <div className="mt-1 text-slate-600">
                        <span className="text-xs text-slate-400 uppercase font-semibold block">SWIFT</span>
                        <span>{bank.swiftCode}</span>
                      </div>
                    )}

                    {/* Bank Operations */}
                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100/50 pt-2.5">
                      {!bank.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultBank(bank.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-sky-600 transition"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditBank(bank)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
                        title="Edit Bank"
                      >
                        <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(bank.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-50 text-rose-600 transition"
                        title="Delete Bank"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === "exercices" && (
        <ExercicesSettings />
      )}

      {/* Add/Edit Bank Modal Overlay */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBank ? "Update Bank Account" : "Link Bank Account"}
              </h3>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4 text-sm">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attijariwafa Bank"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Account Number</label>
                <input
                  type="text"
                  placeholder="Account Number (24 digits)"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">IBAN</label>
                <input
                  type="text"
                  placeholder="International Bank Account Number"
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">SWIFT / BIC Code</label>
                <input
                  type="text"
                  placeholder="SWIFT code"
                  value={bankForm.swiftCode}
                  onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={bankForm.isDefault}
                  onChange={(e) => setBankForm({ ...bankForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Set as default bank option
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  className="flex-1 rounded-2xl bg-sky-600 py-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
                >
                  {savingBank ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingBank ? "Update Bank" : "Add Bank"}</span>
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

export default CompanySettings;
