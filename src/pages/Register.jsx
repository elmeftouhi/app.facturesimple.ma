import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthForm from "../entities/auth/ui/AuthForm";
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
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (values) => {
    setStatus("Submitting...");
    setError("");

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      setStatus("");
      return;
    }

    try {
      const payload = {
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        email: values.email,
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
      setError(err.message || "Unable to connect to backend.");
      setStatus("");
    }
  };

  return (
    <div>
      <AuthForm
        title="Register"
        fields={registerFields}
        submitText="Create account"
        footerText="Create your account to start generating invoices and managing clients."
        onSubmit={handleRegister}
      />
      <p className="mt-4 text-sm text-slate-500">
        Already have an account? <Link className="font-semibold text-sky-600" to="/login">Sign in</Link>
      </p>
      {status ? <p className="mt-3 text-sm text-emerald-600">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export default Register;
