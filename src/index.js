import dotenv from 'dotenv';
import app from './app.js';
import { initDB } from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Initialize database (checks connection and creates tables if missing)
    await initDB();

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  School Backend Server is running!      `);
      console.log(`  Port: ${PORT}                          `);
      console.log(`  Environment: ${NODE_ENV}               `);
      console.log(`  Local URL: http://localhost:${PORT}    `);
      console.log(`=========================================`);
    });

    // Handle graceful shutdown signals
    const shutdown = () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('Server shut down successfully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal: Failed to start server due to database initialization failure:', error);
    process.exit(1);
  }
};

startServer();

