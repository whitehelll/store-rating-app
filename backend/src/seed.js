// Creates tables (idempotent), the first admin, and a little demo data.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function upsertUser(name, email, password, address, role) {
  const { rows: [u] } = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id`,
    [name, email, await bcrypt.hash(password, 10), address, role]
  );
  return u.id;
}

(async () => {
  await db.query(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'));

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  await upsertUser('System Administrator Account', adminEmail, process.env.ADMIN_PASSWORD || 'Admin@1234', 'Head office', 'ADMIN');

  if (process.argv.includes('--no-demo')) return console.log('Admin ready:', adminEmail);

  const demoPw = 'Passw0rd!';
  const owner = await upsertUser('Olivia Store Owner Demo Account', 'owner@example.com', demoPw, '12 Market Street', 'STORE_OWNER');
  const u1 = await upsertUser('Nathan Normal User Demo Account', 'user1@example.com', demoPw, '5 Park Lane', 'USER');
  const u2 = await upsertUser('Priya Normal User Demo Account', 'user2@example.com', demoPw, '9 Lake Road', 'USER');

  const stores = [
    ['Green Basket Grocers', 'green@example.com', '12 Market Street', owner],
    ['Bright Pages Bookshop', 'books@example.com', '44 College Avenue', null],
    ['Daily Grind Coffee House', 'coffee@example.com', '7 Station Road', null],
  ];
  const ids = [];
  for (const [n, e, a, o] of stores) {
    const { rows: [s] } = await db.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id`, [n, e, a, o]);
    ids.push(s.id);
  }
  const seedRatings = [[u1, ids[0], 5], [u2, ids[0], 4], [u1, ids[1], 3]];
  for (const [u, s, r] of seedRatings) {
    await db.query(`INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [u, s, r]);
  }
  console.log(`Seeded. Admin: ${adminEmail}. Demo users (owner@, user1@, user2@example.com) use password ${demoPw}`);
})().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => db.end());
