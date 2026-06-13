import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';

const app = express();

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming urlencoded requests
app.use(express.urlencoded({ extended: true }));

// Register API routes
app.use('/api', apiRouter);

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
// CREATE DATABASE "edu-school"
//     WITH
//     OWNER = postgres
//     ENCODING = 'UTF8'
//     LOCALE_PROVIDER = 'libc'
//     CONNECTION LIMIT = -1
//     IS_TEMPLATE = False;