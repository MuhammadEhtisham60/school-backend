import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, Client } = pg;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'edu-school',
};

// Create a pool for the target database
const pool = new Pool(dbConfig);

// Initialize database and tables
export const initDB = async () => {
  let client;
  try {
    // Test connection to target database
    client = await pool.connect();
    console.log(`Successfully connected to database: ${dbConfig.database}`);
  } catch (err) {
    // Check if error is "database does not exist" (PostgreSQL error code 3D000)
    if (err.code === '3D000') {
      console.log(`Database "${dbConfig.database}" does not exist. Attempting to create it...`);
      try {
        // Connect to the default 'postgres' database to create the new database
        const tempClient = new Client({
          ...dbConfig,
          database: 'postgres',
        });
        await tempClient.connect();
        // CREATE DATABASE cannot run in a transaction, and must be executed outside of one
        await tempClient.query(`CREATE DATABASE "${dbConfig.database}"`);
        await tempClient.end();
        console.log(`Database "${dbConfig.database}" created successfully.`);

        // Reconnect with original pool
        client = await pool.connect();
      } catch (createErr) {
        console.error(`Failed to create database "${dbConfig.database}" automatically:`, createErr);
        throw createErr;
      }
    } else {
      console.error('Database connection error:', err);
      throw err;
    }
  }

  try {
    // Create users table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        contact VARCHAR(50) NOT NULL,
        academic_session VARCHAR(100) NOT NULL,
        reset_otp VARCHAR(6) DEFAULT NULL,
        reset_otp_expiry TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createTableQuery);

    // Run migrations to alter schema if table was created in a previous execution without these columns
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS school_name VARCHAR(255) DEFAULT \'\'');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT \'\'');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS contact VARCHAR(50) DEFAULT \'\'');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_session VARCHAR(100) DEFAULT \'\'');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6) DEFAULT NULL');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP DEFAULT NULL');

    console.log('Users table verified/created successfully.');
  } catch (tableErr) {
    console.error('Failed to initialize users table:', tableErr);
    throw tableErr;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;
