const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validate } = require('../validate');
const { authenticate } = require('../middleware/auth');
const { wrap, isDuplicate } = require('../utils');

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

router.post('/signup', validate(['name', 'email', 'address', 'password']), wrap(async (req, res) => {
  const { name, email, address = '', password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query(
      `INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, 'USER')`,
      [name.trim(), email.toLowerCase(), hash, address]
    );
    res.status(201).json({ message: 'Account created. You can log in now.' });
  } catch (e) {
    if (isDuplicate(e)) return res.status(409).json({ message: 'That email is already registered.', errors: { email: 'That email is already registered.' } });
    throw e;
  }
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const { rows: [u] } = await db.query('SELECT * FROM users WHERE email = $1', [String(email || '').toLowerCase()]);
  if (!u || !(await bcrypt.compare(String(password || ''), u.password_hash))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  res.json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}));

router.put('/password', authenticate, validate(['password']), wrap(async (req, res) => {
  const { currentPassword, password } = req.body;
  const { rows: [u] } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!u || !(await bcrypt.compare(String(currentPassword || ''), u.password_hash))) {
    return res.status(400).json({ message: 'Current password is incorrect.', errors: { currentPassword: 'Current password is incorrect.' } });
  }
  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(password, 10), req.user.id]);
  res.json({ message: 'Password updated.' });
}));

module.exports = router;
