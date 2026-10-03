import { useState } from 'react';
import { validate } from '../validators.js';
import { errorMessage } from '../api.js';

// fields: [{ name, label, type, rule, options, hint }]
// onSubmit(values) -> resolves to a success message; throw to show an error.
export default function Form({ fields, initial, submitLabel, onSubmit, resetOnSuccess = false }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    const found = validate(fields, values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const msg = await onSubmit(values);
      if (msg) setStatus({ ok: true, text: msg });
      if (resetOnSuccess) setValues(initial);
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      setStatus({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {fields.map((f) => (
        <label key={f.name} className="field">
          <span className="label">{f.label}</span>
          {f.type === 'select' ? (
            <select value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea rows="3" value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
          ) : (
            <input
              type={f.type || 'text'}
              value={values[f.name]}
              autoComplete={f.type === 'password' ? 'new-password' : 'off'}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
          {errors[f.name] ? <span className="error">{errors[f.name]}</span> : f.hint ? <span className="hint">{f.hint}</span> : null}
        </label>
      ))}
      {status && <p className={status.ok ? 'notice ok' : 'notice bad'} role="status">{status.text}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Working…' : submitLabel}</button>
    </form>
  );
}
