import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { register } from "../services/authService";

const registerFields = [
  { name: "fullName", label: "Full name", type: "text" },
  { name: "email", label: "Email address", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm password", type: "password" }
];

function Register() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
        fullName: values.fullName,
        email: values.email,
        password: values.password
      };
      await register(payload);
      setStatus("Registration successful. Backend connection is working.");
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
      {status ? <p className="mt-3 text-sm text-emerald-600">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export default Register;
