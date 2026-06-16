import pg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'edu-school',
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, email FROM users LIMIT 1');
  if (res.rows.length === 0) {
    console.error('No users found in database to generate auth token!');
    await client.end();
    return;
  }
  const user = res.rows[0];
  console.log('Using user:', user);

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_me',
    { expiresIn: '1h' }
  );
  console.log('Generated token:', token);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
