import { useState } from "react";

function AuthForm({ title, fields, submitText, footerText, onSubmit }) {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});

  const [values, setValues] = useState(initialState);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit(values);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={field.name}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                value={values[field.name]}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                rows={4}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={field.type === "checkbox" ? undefined : values[field.name]}
                checked={field.type === "checkbox" ? values[field.name] : undefined}
                onChange={handleChange}
                className={`w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
                  field.type === "checkbox" ? "h-4 w-4" : ""
                }`}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          {submitText}
        </button>
      </form>
      {footerText ? <p className="mt-4 text-sm text-slate-500">{footerText}</p> : null}
    </div>
  );
}

export default AuthForm;
