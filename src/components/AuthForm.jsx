import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
  faEye,
  faEyeSlash,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

function AuthForm({ title, fields, submitText, footerText, onSubmit, errors = {}, submitting = false }) {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});

  const [values, setValues] = useState(initialState);
  const [showPasswords, setShowPasswords] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    if (typeof onSubmit === "function") {
      onSubmit(values);
    }
  };

  const getFieldIcon = (field) => {
    if (field.type === "email" || field.name === "email") return faEnvelope;
    if (field.type === "password" || field.name === "password" || field.name === "confirmPassword") return faLock;
    if (field.name === "firstName" || field.name === "lastName") return faUser;
    if (field.type === "tel" || field.name === "phone") return faPhone;
    return null;
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      {footerText && <p className="mt-1.5 text-xs text-slate-400">{footerText}</p>}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {fields.map((field) => {
          const hasIcon = getFieldIcon(field) !== null;
          const isPassword = field.type === "password";
          const inputType = isPassword && showPasswords[field.name] ? "text" : field.type;
          const isCheckbox = field.type === "checkbox";

          if (isCheckbox) {
            return (
              <div key={field.name} className="flex items-center gap-2 pt-1">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={values[field.name]}
                  onChange={handleChange}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50"
                />
                <label htmlFor={field.name} className="text-xs font-semibold text-slate-600 cursor-pointer">
                  {field.label}
                </label>
              </div>
            );
          }

          return (
            <div key={field.name} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500" htmlFor={field.name}>
                {field.label}
              </label>
              <div className="relative flex items-center">
                {hasIcon && (
                  <span className="absolute left-4 text-slate-400 pointer-events-none">
                    <FontAwesomeIcon icon={getFieldIcon(field)} className="h-4 w-4" />
                  </span>
                )}

                <input
                  id={field.name}
                  name={field.name}
                  type={inputType}
                  value={values[field.name]}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full rounded-2xl border bg-slate-50 py-4 text-base text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 ${
                    hasIcon ? "pl-12" : "px-4"
                  } ${isPassword ? "pr-12" : "pr-4"} ${
                    errors[field.name]
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
                      : "border-slate-200"
                  }`}
                />

                {isPassword && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    disabled={submitting}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={showPasswords[field.name] ? faEyeSlash : faEye} className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-sky-600 px-5 py-4 text-sm font-semibold tracking-wide text-white shadow-sm hover:bg-sky-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
        >
          {submitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin h-3.5 w-3.5" />}
          <span>{submitText}</span>
        </button>
      </form>
    </div>
  );
}

export default AuthForm;
