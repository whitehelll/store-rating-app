// Mirrors backend/src/validate.js so users see errors before submitting.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export const rules = {
  name: (v) => (v.trim().length >= 20 && v.trim().length <= 60 ? '' : 'Name must be 20-60 characters.'),
  storeName: (v) => (v.trim().length >= 1 && v.trim().length <= 255 ? '' : 'Store name is required (max 255 characters).'),
  email: (v) => (EMAIL.test(v) ? '' : 'Enter a valid email address.'),
  address: (v) => (v.length <= 400 ? '' : 'Address can be at most 400 characters.'),
  password: (v) => (PASSWORD.test(v) ? '' : 'Use 8-16 characters with at least one uppercase letter and one special character.'),
  required: (v) => (v ? '' : 'This field is required.'),
  optionalEmail: (v) => (!v || EMAIL.test(v) ? '' : 'Enter a valid email address.'),
};

export function validate(fields, values) {
  const errors = {};
  for (const f of fields) {
    const rule = rules[f.rule || f.name];
    const msg = rule ? rule(values[f.name] ?? '') : '';
    if (msg) errors[f.name] = msg;
  }
  return errors;
}
