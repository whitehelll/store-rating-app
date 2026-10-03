const router = require('express').Router();
const db = require('../db');
const { validate } = require('../validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { wrap, orderBy } = require('../utils');

router.use(authenticate, requireRole('USER'));

// All stores with overall rating and the signed-in user's own rating.
router.get('/', wrap(async (req, res) => {
  const { search, sort, order } = req.query;
  const params = [req.user.id];
  let where = '';
  if (search) {
    params.push(`%${String(search).replace(/[\\%_]/g, '\\$&')}%`);
    where = `WHERE s.name ILIKE $2 OR s.address ILIKE $2`;
  }
  const sortMap = { name: 's.name', address: 's.address', rating: 'AVG(r.rating)', myRating: 'mine.rating' };
  const { rows } = await db.query(
    `SELECT s.id, s.name, s.address, ROUND(AVG(r.rating), 1) AS rating, mine.rating AS "myRating"
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     LEFT JOIN ratings mine ON mine.store_id = s.id AND mine.user_id = $1
     ${where} GROUP BY s.id, mine.rating ${orderBy(sortMap, sort, order, 'name')}, s.id`,
    params
  );
  res.json(rows);
}));

// Submit or modify a rating (one per user per store).
router.put('/:id/rating', validate(['rating']), wrap(async (req, res) => {
  const storeId = parseInt(req.params.id, 10) || 0;
  const { rows: [s] } = await db.query('SELECT id FROM stores WHERE id = $1', [storeId]);
  if (!s) return res.status(404).json({ message: 'Store not found.' });
  await db.query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()`,
    [req.user.id, storeId, req.body.rating]
  );
  res.json({ message: 'Rating saved.' });
}));

module.exports = router;
