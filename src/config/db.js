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
        class_fees NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createStudentsTableQuery);

    // Run migrations to alter schema if table was created in a previous execution without this column
    await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE');
    await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS fees JSONB DEFAULT \'{}\'');
    await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS class_fees NUMERIC DEFAULT 0');

    console.log('Students table verified/created successfully.');

    // Create classes table if not exists
    const createClassesTableQuery = `
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        display_order INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createClassesTableQuery);
    console.log('Classes table verified/created successfully.');

    // Create class_subjects table if not exists
    const createClassSubjectsTableQuery = `
      CREATE TABLE IF NOT EXISTS class_subjects (
        id SERIAL PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        subject_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (class_id, subject_name)
      );
    `;
    await client.query(createClassSubjectsTableQuery);
    console.log('Class subjects table verified/created successfully.');


    // Seed default classes if the table is empty
    const seedClassesQuery = `
      INSERT INTO classes (id, name, display_order)
      VALUES 
        ('Nursery', 'Class Nursery', 1),
        ('KG', 'Class KG', 2),
        ('1', 'Class 1', 3),
        ('2', 'Class 2', 4),
        ('3', 'Class 3', 5),
        ('4', 'Class 4', 6),
        ('5', 'Class 5', 7),
        ('6', 'Class 6', 8),
        ('7', 'Class 7', 9),
        ('8', 'Class 8', 10),
        ('9', 'Class 9', 11),
        ('10', 'Class 10', 12),
        ('11', 'Class 11', 13),
        ('12', 'Class 12', 14)
      ON CONFLICT (id) DO NOTHING;
    `;
    await client.query(seedClassesQuery);
    console.log('Default classes seeded successfully.');

    // Create fees table if not exists
    const createFeesTableQuery = `
      CREATE TABLE IF NOT EXISTS fees (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        month VARCHAR(20) NOT NULL,
        amount NUMERIC NOT NULL CHECK (amount > 0),
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Paid',
        remarks TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, month)
      );
    `;
    await client.query(createFeesTableQuery);
    console.log('Fees table verified/created successfully.');

    // Create academic_records table if not exists
    const createAcademicRecordsTableQuery = `
      CREATE TABLE IF NOT EXISTS academic_records (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        academic_year VARCHAR(50) NOT NULL,
        class VARCHAR(50) NOT NULL,
        section VARCHAR(50) NOT NULL,
        roll_no VARCHAR(100),
        promotion_status VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, academic_year, class)
      );
    `;
    await client.query(createAcademicRecordsTableQuery);
    console.log('Academic records table verified/created successfully.');

    // Create term_results table if not exists
    const createTermResultsTableQuery = `
      CREATE TABLE IF NOT EXISTS term_results (
        id SERIAL PRIMARY KEY,
        academic_record_id INTEGER NOT NULL REFERENCES academic_records(id) ON DELETE CASCADE,
        term_name VARCHAR(50) NOT NULL,
        total_marks NUMERIC NOT NULL CHECK (total_marks >= 0),
        obtained_marks NUMERIC NOT NULL CHECK (obtained_marks >= 0),
        percentage NUMERIC NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
        grade VARCHAR(10) NOT NULL,
        gpa NUMERIC DEFAULT NULL,
        position INTEGER DEFAULT NULL,
        remarks TEXT,
        result_status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (academic_record_id, term_name),
        CONSTRAINT check_term_obtained_marks CHECK (obtained_marks <= total_marks)
      );
    `;
    await client.query(createTermResultsTableQuery);
    console.log('Term results table verified/created successfully.');

    // Create subject_marks table if not exists
    const createSubjectMarksTableQuery = `
      CREATE TABLE IF NOT EXISTS subject_marks (
        id SERIAL PRIMARY KEY,
        term_result_id INTEGER NOT NULL REFERENCES term_results(id) ON DELETE CASCADE,
        subject_name VARCHAR(100) NOT NULL,
        total_marks NUMERIC NOT NULL CHECK (total_marks > 0),
        obtained_marks NUMERIC NOT NULL CHECK (obtained_marks >= 0),
        grade VARCHAR(10),
        gpa NUMERIC DEFAULT NULL,
        status VARCHAR(20),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (term_result_id, subject_name),
        CONSTRAINT check_subject_obtained_marks CHECK (obtained_marks <= total_marks)
      );
    `;
    await client.query(createSubjectMarksTableQuery);
    console.log('Subject marks table verified/created successfully.');

  } catch (tableErr) {
    console.error('Failed to initialize database tables:', tableErr);
    throw tableErr;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;
