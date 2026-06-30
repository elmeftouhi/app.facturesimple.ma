import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faEnvelope,
  faPhone,
  faUserShield
} from "@fortawesome/free-solid-svg-icons";
import { getMe, updateMe } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function UserProfile() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Alert states
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success"); // 'success' | 'error'
  const [alertState, setAlertState] = useState("hidden"); // 'entering' | 'exiting' | 'hidden'

  // Form State
  const [profileForm, setProfileForm] = useState({
    email: "",
    displayedName: "",
    firstName: "",
    lastName: "",
    phone: "",
    status: "",
    roles: []
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMe();
      if (data) {
        setProfileForm({
          email: data.email || "",
          displayedName: data.displayedName || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          status: data.status || "",
          roles: data.roles || []
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    return () => {
      if (window.profileAlertTimeout1) clearTimeout(window.profileAlertTimeout1);
      if (window.profileAlertTimeout2) clearTimeout(window.profileAlertTimeout2);
    };
  }, []);

  const triggerAlert = (message, type = "success") => {
    setAlertMsg(message);
    setAlertType(type);
    setAlertState("entering");

    if (window.profileAlertTimeout1) clearTimeout(window.profileAlertTimeout1);
    if (window.profileAlertTimeout2) clearTimeout(window.profileAlertTimeout2);

    window.profileAlertTimeout1 = setTimeout(() => {
      setAlertState("exiting");
    }, 4000); // visible for 4s

    window.profileAlertTimeout2 = setTimeout(() => {
      setAlertState("hidden");
      setAlertMsg("");
    }, 4300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        firstName: profileForm.firstName.trim() || undefined,
        lastName: profileForm.lastName.trim() || undefined,
        phone: profileForm.phone.trim() || undefined
      };

      await updateMe(payload);
      
      // Sync global context state immediately
      const refreshedUser = await refreshUser();
      if (refreshedUser) {
        setProfileForm((prev) => ({
          ...prev,
          displayedName: refreshedUser.displayedName || prev.displayedName
        }));
      }

      triggerAlert("Profile updated successfully!", "success");
    } catch (err) {
      triggerAlert(err.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
        <p className="mt-3 text-sm">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal settings, display name, and contact details.</p>
      </div>

      {/* Viewport Floating Alert Banner */}
      {alertState !== "hidden" && (
        <div
          className={`fixed top-6 left-1/2 z-[10000] w-full max-w-md px-4 ${
            alertState === "entering" ? "animate-alert-enter" : "animate-alert-exit"
          }`}
        >
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 shadow-xl ${
              alertType === "success"
                ? "border-emerald-200 bg-white text-emerald-800"
                : "border-rose-200 bg-white text-rose-800"
            }`}
          >
            <FontAwesomeIcon
              icon={alertType === "success" ? faCheckCircle : faExclamationTriangle}
              className={`h-5 w-5 shrink-0 ${alertType === "success" ? "text-emerald-500" : "text-rose-500"}`}
            />
            <span className="text-sm font-semibold">{alertMsg}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Form: Edit Details */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-slate-400" />
              <span>Personal Details</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">First Name</label>
                <input
                  type="text"
                  placeholder="Yassine"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Last Name</label>
                <input
                  type="text"
                  placeholder="EL MEFTOUHI"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    placeholder="+212661098984"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>
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
                  <span>Update Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Info: Read Only Metadata */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Account Status</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase">Email Address</div>
                  <div className="font-semibold text-slate-800 break-all">{profileForm.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <FontAwesomeIcon icon={faUserShield} className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase">System Role</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {profileForm.roles.map((role) => (
                      <span key={role} className="rounded-md bg-sky-100 px-2 py-0.5 text-xxs font-semibold text-sky-800">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase">User Status</div>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xxs font-bold ${
                    profileForm.status === "ACTIVE" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-slate-100 text-slate-800"
                  }`}>
                    {profileForm.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
