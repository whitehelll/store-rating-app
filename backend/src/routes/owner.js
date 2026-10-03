const router = require('express').Router();
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { wrap, orderBy } = require('../utils');

router.use(authenticate, requireRole('STORE_OWNER'));

router.get('/dashboard', wrap(async (req, res) => {
  const { sort, order } = req.query;
  const { rows: [store] } = await db.query(
    `SELECT s.id, s.name, s.address, ROUND(AVG(r.rating), 1) AS average, COUNT(r.id)::int AS "ratingCount"
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = $1 GROUP BY s.id ORDER BY s.id LIMIT 1`,
    [req.user.id]
  );
  if (!store) return res.json({ store: null, raters: [] });
  const sortMap = { name: 'u.name', email: 'u.email', rating: 'r.rating', date: 'r.updated_at' };
  const { rows: raters } = await db.query(
    `SELECT u.id, u.name, u.email, r.rating, r.updated_at AS "ratedAt"
     FROM ratings r JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1 ${orderBy(sortMap, sort, order, 'date')}`,
    [store.id]
  );
  res.json({ store, raters });
}));

module.exports = router;
