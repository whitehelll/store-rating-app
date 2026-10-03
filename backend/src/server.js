require('dotenv').config();
if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('Set JWT_SECRET and DATABASE_URL in backend/.env (see .env.example).');
  process.exit(1);
}
const app = require('./app');
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
