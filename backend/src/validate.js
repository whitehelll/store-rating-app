const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

// Each rule returns true or an error message.
const rules = {
  name: (v) => (typeof v === 'string' && v.trim().length >= 20 && v.trim().length <= 60) || 'Name must be 20-60 characters.',
  storeName: (v) => (typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= 255) || 'Store name is required (max 255 characters).',
  email: (v) => (typeof v === 'string' && v.length <= 255 && EMAIL.test(v)) || 'Enter a valid email address.',
  address: (v) => v === undefined || v === null || (typeof v === 'string' && v.length <= 400) || 'Address can be at most 400 characters.',
  password: (v) => (typeof v === 'string' && PASSWORD.test(v)) || 'Password must be 8-16 characters with at least one uppercase letter and one special character.',
  role: (v) => ['ADMIN', 'USER', 'STORE_OWNER'].includes(v) || 'Choose a valid role.',
  rating: (v) => (Number.isInteger(v) && v >= 1 && v <= 5) || 'Rating must be a whole number from 1 to 5.',
};

// validate(['name', 'email', 'field:rule']) -> middleware
function validate(specs) {
  return (req, res, next) => {
    const errors = {};
    for (const spec of specs) {
      const [field, rule] = spec.split(':');
      const result = rules[rule || field](req.body[field]);
      if (result !== true) errors[field] = result;
    }
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
    next();
  };
}

module.exports = { validate, rules };
