import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

const loginFields = [
  { name: "email", label: "Email address", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "remember", label: "Remember me", type: "checkbox" }
];

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [status, setStatus] = useState("");
  
  // Alert & validation states
  const [notification, setNotification] = useState("");
  const [notificationState, setNotificationState] = useState("hidden"); // 'entering' | 'exiting' | 'hidden'
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      if (window.loginAlertTimeout1) clearTimeout(window.loginAlertTimeout1);
      if (window.loginAlertTimeout2) clearTimeout(window.loginAlertTimeout2);
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const triggerAlert = (message) => {
    setNotification(message);
    setNotificationState("entering");

    if (window.loginAlertTimeout1) clearTimeout(window.loginAlertTimeout1);
    if (window.loginAlertTimeout2) clearTimeout(window.loginAlertTimeout2);

    window.loginAlertTimeout1 = setTimeout(() => {
      setNotificationState("exiting");
    }, 4000); // visible for 4 seconds

    window.loginAlertTimeout2 = setTimeout(() => {
      setNotificationState("hidden");
      setNotification("");
    }, 4300); // 300ms transition finishes
  };

  const handleLogin = async (values) => {
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

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      triggerAlert("Email and password are required fields.");
      return;
    }

    setStatus("Submitting...");

    try {
      const payload = {
        email: values.email.trim(),
        password: values.password,
        remember: values.remember
      };
      await login(payload);
      setStatus("Login successful. Redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Backend error displayed in animated alert
      triggerAlert(err.message || "Invalid email or password.");
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
        title="Welcome Back"
        fields={loginFields}
        submitText="Sign in to account"
        onSubmit={handleLogin}
        errors={validationErrors}
        submitting={status !== ""}
      />
      <p className="mt-5 text-center text-sm text-slate-500">
        No account yet? <Link className="font-semibold text-sky-600 hover:text-sky-700 hover:underline transition" to="/register">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
