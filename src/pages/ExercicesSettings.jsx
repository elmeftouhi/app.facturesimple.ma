import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLock, faLockOpen, faSpinner, faCalendarAlt, faExclamationCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { createExercice, updateExerciceStatus } from "../api/exerciceApi";
import { useAuth } from "../context/AuthContext";

function ExercicesSettings() {
  const { exercices, refreshExercices } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please provide a name for the fiscal year.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("Please define start and end dates.");
      return;
    }

    setLoading(true);
    try {
      await createExercice({
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate
      });
      setSuccess(`Fiscal year "${form.name}" opened successfully!`);
      setForm({ name: "", startDate: "", endDate: "" });
      setShowForm(false);
      await refreshExercices();
    } catch (err) {
      setError(err.message || "Failed to create fiscal year.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ex) => {
    const nextStatus = ex.status === "OPEN" ? "CLOSED" : "OPEN";
    const confirmMsg =
      nextStatus === "CLOSED"
        ? `Are you sure you want to CLOSE "${ex.name}"? This will lock all invoices belonging to this year and prevent updates or deletions.`
        : `Are you sure you want to RE-OPEN "${ex.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setError("");
    setSuccess("");
    try {
      await updateExerciceStatus(ex.id, nextStatus);
      setSuccess(`Fiscal year "${ex.name}" status updated to ${nextStatus}!`);
      await refreshExercices();
    } catch (err) {
      setError(err.message || "Failed to update fiscal year status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fiscal Years (Exercices)</h2>
          <p className="text-xs text-slate-500">Manage tax year ranges and lock historical invoices from edits.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            <span>Open New Year</span>
          </button>
        )}
      </div>

      {/* Success/Error Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-700">
          <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-700">
          <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Open Fiscal Year Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4">
          <div className="text-sm font-bold text-slate-800">Open New Fiscal Year</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="ex_name" className="text-xxs font-bold uppercase tracking-wider text-slate-500">
                Year Name
              </label>
              <input
                id="ex_name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="e.g. FY 2026/2027"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ex_start" className="text-xxs font-bold uppercase tracking-wider text-slate-500">
                Start Date
              </label>
              <input
                id="ex_start"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ex_end" className="text-xxs font-bold uppercase tracking-wider text-slate-500">
                End Date
              </label>
              <input
                id="ex_end"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin h-3.5 w-3.5" />}
              <span>Save & Open</span>
            </button>
          </div>
        </form>
      )}

      {/* Fiscal Years List Table */}
      {exercices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl">
          <FontAwesomeIcon icon={faCalendarAlt} className="h-10 w-10 text-slate-200 mb-3" />
          <p className="text-sm font-semibold">No fiscal years defined.</p>
          <p className="text-xs text-slate-400 mt-1">Open a fiscal year to begin registering invoices.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xxs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exercices.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50/30 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{ex.name}</td>
                  <td className="px-6 py-4 text-slate-600">{ex.startDate}</td>
                  <td className="px-6 py-4 text-slate-600">{ex.endDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xxs font-semibold ${
                        ex.status === "OPEN"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <FontAwesomeIcon icon={ex.status === "OPEN" ? faLockOpen : faLock} className="h-2.5 w-2.5" />
                      <span>{ex.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ex)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xxs font-semibold transition ${
                        ex.status === "OPEN"
                          ? "border-rose-100 bg-rose-50/50 text-rose-600 hover:bg-rose-100/50"
                          : "border-emerald-100 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100/50"
                      }`}
                    >
                      <FontAwesomeIcon icon={ex.status === "OPEN" ? faLock : faLockOpen} className="h-2.5 w-2.5" />
                      <span>{ex.status === "OPEN" ? "Close Year" : "Re-open Year"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExercicesSettings;
