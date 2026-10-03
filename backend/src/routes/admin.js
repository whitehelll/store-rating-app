const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { validate } = require('../validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { wrap, orderBy, filters, isDuplicate } = require('../utils');

router.use(authenticate, requireRole('ADMIN'));

const OWNER_RATING = `(SELECT ROUND(AVG(r.rating), 1) FROM ratings r JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id)`;
const dupEmail = (res) => res.status(409).json({ message: 'That email is already in use.', errors: { email: 'That email is already in use.' } });

router.get('/stats', wrap(async (req, res) => {
  const { rows: [s] } = await db.query(
    `SELECT (SELECT COUNT(*) FROM users)::int AS users,
            (SELECT COUNT(*) FROM stores)::int AS stores,
            (SELECT COUNT(*) FROM ratings)::int AS ratings`
  );
  res.json(s);
}));

router.post('/users', validate(['name', 'email', 'address', 'password', 'role']), wrap(async (req, res) => {
  const { name, email, address = '', password, role } = req.body;
  try {
    const { rows: [u] } = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
      [name.trim(), email.toLowerCase(), await bcrypt.hash(password, 10), address, role]
    );
    res.status(201).json(u);
  } catch (e) {
    if (isDuplicate(e)) return dupEmail(res);
    throw e;
  }
}));

router.post('/stores', validate(['name:storeName', 'email', 'address']), wrap(async (req, res) => {
  const { name, email, address = '', ownerEmail } = req.body;
  let ownerId = null;
  if (ownerEmail) {
    const { rows: [o] } = await db.query(`SELECT id FROM users WHERE email = $1 AND role = 'STORE_OWNER'`, [ownerEmail.toLowerCase()]);
    if (!o) return res.status(400).json({ message: 'No store owner has that email.', errors: { ownerEmail: 'No store owner has that email.' } });
    ownerId = o.id;
  }
  try {
    const { rows: [s] } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address`,
      [name.trim(), email.toLowerCase(), address, ownerId]
    );
    res.status(201).json(s);
  } catch (e) {
    if (isDuplicate(e)) return dupEmail(res);
    throw e;
  }
}));

router.get('/users', wrap(async (req, res) => {
  const { name, email, address, role, sort, order } = req.query;
  const f = filters();
  f.like('u.name', name); f.like('u.email', email); f.like('u.address', address); f.eq('u.role::text', role);
  const sortMap = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role::text', rating: OWNER_RATING };
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            CASE WHEN u.role = 'STORE_OWNER' THEN ${OWNER_RATING} END AS rating
     FROM users u ${f.sql()} ${orderBy(sortMap, sort, order, 'name')}, u.id`,
    f.params
  );
  res.json(rows);
}));

router.get('/users/:id', wrap(async (req, res) => {
  const { rows: [u] } = await db.query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            CASE WHEN u.role = 'STORE_OWNER' THEN ${OWNER_RATING} END AS rating
     FROM users u WHERE u.id = $1`,
    [parseInt(req.params.id, 10) || 0]
  );
  if (!u) return res.status(404).json({ message: 'User not found.' });
  res.json(u);
}));

router.get('/stores', wrap(async (req, res) => {
  const { name, email, address, sort, order } = req.query;
  const f = filters();
  f.like('s.name', name); f.like('s.email', email); f.like('s.address', address);
  const sortMap = { name: 's.name', email: 's.email', address: 's.address', rating: 'AVG(r.rating)' };
  const { rows } = await db.query(
    `SELECT s.id, s.name, s.email, s.address, ROUND(AVG(r.rating), 1) AS rating
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
     ${f.sql()} GROUP BY s.id ${orderBy(sortMap, sort, order, 'name')}, s.id`,
    f.params
  );
  res.json(rows);
}));

module.exports = router;
