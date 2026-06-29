import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (values) => {
    setStatus("Submitting...");
    setError("");

    try {
      const payload = {
        email: values.email,
        password: values.password,
        remember: values.remember
      };
      await login(payload);
      setStatus("Login successful. Redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to backend.");
      setStatus("");
    }
  };

  return (
    <div>
      <AuthForm
        title="Login"
        fields={loginFields}
        submitText="Sign in"
        footerText="Enter your email and password to access your account."
        onSubmit={handleLogin}
      />
      <p className="mt-4 text-sm text-slate-500">
        No account yet? <Link className="font-semibold text-sky-600" to="/register">Create one</Link>
      </p>
      {status ? <p className="mt-3 text-sm text-emerald-600">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export default Login;
