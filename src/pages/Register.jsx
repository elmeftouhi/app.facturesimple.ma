import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

const registerFields = [
  { name: "firstName", label: "First name (optional)", type: "text" },
  { name: "lastName", label: "Last name (optional)", type: "text" },
  { name: "email", label: "Email address", type: "email" },
  { name: "phone", label: "Phone (optional)", type: "tel" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm password", type: "password" }
];

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [status, setStatus] = useState("");
  
  // Alert & validation states
  const [notification, setNotification] = useState("");
  const [notificationState, setNotificationState] = useState("hidden"); // 'entering' | 'exiting' | 'hidden'
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      if (window.registerAlertTimeout1) clearTimeout(window.registerAlertTimeout1);
      if (window.registerAlertTimeout2) clearTimeout(window.registerAlertTimeout2);
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const triggerAlert = (message) => {
    setNotification(message);
    setNotificationState("entering");

    if (window.registerAlertTimeout1) clearTimeout(window.registerAlertTimeout1);
    if (window.registerAlertTimeout2) clearTimeout(window.registerAlertTimeout2);

    window.registerAlertTimeout1 = setTimeout(() => {
      setNotificationState("exiting");
    }, 4000); // visible for 4 seconds

    window.registerAlertTimeout2 = setTimeout(() => {
      setNotificationState("hidden");
      setNotification("");
    }, 4300); // 300ms transition finishes
  };

  const handleRegister = async (values) => {
    setValidationErrors({});
    setStatus("");

    // Client-side UI validation with highlighting
    const errors = {};
    if (!values.email || !values.email.trim()) {
      errors.email = true;
    }
    if (!values.password || !values.password.trim()) {
      errors.password = true;
    }
    if (!values.confirmPassword || !values.confirmPassword.trim()) {
      errors.confirmPassword = true;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerAlert("Email and password fields are required.");
      return;
    }

    if (values.password !== values.confirmPassword) {
      setValidationErrors({
        password: true,
        confirmPassword: true
      });
      triggerAlert("Passwords do not match.");
      return;
    }

    setStatus("Submitting...");

    try {
      const payload = {
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        email: values.email.trim(),
        phone: values.phone || undefined,
        password: values.password
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      await register(payload);
      setStatus("Registration successful. Redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      triggerAlert(err.message || "Failed to register account.");
      setStatus("");
    }
  };

  return (
    <div className="relative">
      {/* Animated Top Viewport Alert */}
      {notificationState !== "hidden" && (
        <div
          className={`fixed top-6 left-1/2 z-[10000] w-full max-w-md px-4 -translate-x-1/2 ${
            notificationState === "entering" ? "animate-alert-enter" : "animate-alert-exit"
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-xl text-rose-800">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-rose-500 shrink-0" />
            <span className="text-sm font-semibold">{notification}</span>
          </div>
        </div>
      )}

      <AuthForm
        title="Create Account"
        fields={registerFields}
        submitText="Get started"
        onSubmit={handleRegister}
        errors={validationErrors}
        submitting={status !== ""}
      />
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account? <Link className="font-semibold text-sky-600 hover:text-sky-700 hover:underline transition" to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
