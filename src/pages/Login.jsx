import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { login } from "../services/authService";

const loginFields = [
  { name: "email", label: "Email address", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "remember", label: "Remember me", type: "checkbox" }
];

function Login() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
      setStatus("Login successful. Backend connection is working.");
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
      {status ? <p className="mt-3 text-sm text-emerald-600">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export default Login;
