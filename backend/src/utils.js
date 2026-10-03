// Wrap async handlers so rejected promises reach the error middleware.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Build ORDER BY from an allow-list (never interpolate user input directly).
function orderBy(map, sort, order, fallback) {
  const col = map[sort] || map[fallback];
  const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${col} ${dir} NULLS LAST`;
}

// Collects parameterised WHERE clauses.
function filters() {
  const params = [];
  const where = [];
  return {
    params,
    like(column, value) {
      if (!value) return;
      params.push(`%${String(value).replace(/[\\%_]/g, '\\$&')}%`);
      where.push(`${column} ILIKE $${params.length}`);
    },
    eq(column, value) {
      if (!value) return;
      params.push(value);
      where.push(`${column} = $${params.length}`);
    },
    sql: () => (where.length ? `WHERE ${where.join(' AND ')}` : ''),
  };
}

const isDuplicate = (e) => e && e.code === '23505';

module.exports = { wrap, orderBy, filters, isDuplicate };
