import { useEffect, useState } from "react";

const normalizeValueForInput = (type, value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (type === "datetime-local") {
    return String(value).slice(0, 16);
  }

  return value;
};

const normalizeValueForApi = (type, value) => {
  if (value === "") {
    return null;
  }

  if (type === "datetime-local") {
    return `${value.replace("T", " ")}:00`;
  }

  return value;
};

const EntityForm = ({ entity, initialData, onSubmit, onCancel, isSaving }) => {
  const [formState, setFormState] = useState({});

  useEffect(() => {
    const nextState = {};

    entity.formFields.forEach((field) => {
      nextState[field.name] = normalizeValueForInput(field.type, initialData?.[field.name]);
    });

    setFormState(nextState);
  }, [entity, initialData]);

  const handleChange = (fieldName, value) => {
    setFormState((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Empty optional values are converted to null so MySQL receives valid values.
    const payload = Object.fromEntries(
      entity.formFields.map((field) => [
        field.name,
        normalizeValueForApi(field.type, formState[field.name] ?? ""),
      ]),
    );

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{initialData ? `Edit ${entity.label}` : `Add ${entity.label}`}</h3>
          <p className="text-sm text-slate-300">This form writes directly to the MySQL columns defined in the schema.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entity.formFields.map((field) => (
          <label key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            <span className="mb-2 block text-sm font-medium text-slate-200">{field.label}</span>

            {field.type === "select" ? (
              <select
                value={formState[field.name] ?? ""}
                required={field.required}
                onChange={(event) => handleChange(field.name, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={formState[field.name] ?? ""}
                required={field.required}
                onChange={(event) => handleChange(field.name, event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
              />
            ) : (
              <input
                type={field.type}
                value={formState[field.name] ?? ""}
                required={field.required}
                step={field.step}
                onChange={(event) => handleChange(field.name, event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : initialData ? "Update Record" : "Create Record"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EntityForm;
