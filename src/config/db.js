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

    // Create students table if not exists
    const createStudentsTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        father_name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(50) NOT NULL,
        roll_no VARCHAR(100) DEFAULT NULL,
        cnic VARCHAR(100) DEFAULT NULL,
        photo VARCHAR(255) DEFAULT NULL,
        class VARCHAR(50) NOT NULL,
        section VARCHAR(50) NOT NULL,
        prev_school VARCHAR(255) DEFAULT NULL,
        last_result NUMERIC DEFAULT NULL,
        admission_date DATE DEFAULT NULL,
        mobile VARCHAR(100) NOT NULL,
        alt_contact VARCHAR(100) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        city VARCHAR(255) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        father_full_name VARCHAR(255) DEFAULT NULL,
        father_cnic VARCHAR(100) DEFAULT NULL,
        occupation VARCHAR(255) DEFAULT NULL,
        father_phone VARCHAR(100) DEFAULT NULL,
        mother_name VARCHAR(255) DEFAULT NULL,
        mother_phone VARCHAR(100) DEFAULT NULL,
        blood VARCHAR(10) DEFAULT NULL,
        emergency VARCHAR(100) DEFAULT NULL,
        medical TEXT DEFAULT NULL,
        disability TEXT DEFAULT NULL,
        transport BOOLEAN DEFAULT FALSE,
        bus_route VARCHAR(255) DEFAULT NULL,
        hostel BOOLEAN DEFAULT FALSE,
        student_photo VARCHAR(255) DEFAULT NULL,
        b_form_copy VARCHAR(255) DEFAULT NULL,
        prev_result_card VARCHAR(255) DEFAULT NULL,
        guardian_cnic VARCHAR(255) DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        fees JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createStudentsTableQuery);

    // Run migrations to alter schema if table was created in a previous execution without this column
    await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE');
    await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS fees JSONB DEFAULT \'{}\'');

    console.log('Students table verified/created successfully.');
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
