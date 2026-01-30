import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database configuration with multiple connection options
const dbConfig = {
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "hostel_allotment",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  socketPath: process.env.DB_SOCKET_PATH || "/tmp/mysql.sock",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Try multiple connection methods
const createDatabasePool = () => {
  // First try socket connection (if path exists)
  if (process.env.DB_SOCKET_PATH || process.platform !== 'win32') {
    try {
      return mysql.createPool({
        ...dbConfig,
        socketPath: dbConfig.socketPath
      });
    } catch (error) {
      console.warn("⚠️ Socket connection failed, trying host connection");
    }
  }
  
  // Fallback to host connection
  const { socketPath, ...hostConfig } = dbConfig;
  return mysql.createPool(hostConfig);
};

const pool = createDatabasePool();

// Enhanced connection test with retry logic
export const testConnection = async (retries: number = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Database connected successfully");
      
      // Test a simple query
      await connection.execute('SELECT 1');
      connection.release();
      
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error);
      if (i === retries - 1) {
        console.error("❌ All database connection attempts failed");
        console.error("💡 Check your database configuration:");
        console.error("   - DB_USER:", process.env.DB_USER || "root");
        console.error("   - DB_HOST:", process.env.DB_HOST || "localhost");
        console.error("   - DB_PORT:", process.env.DB_PORT || "3306");
        console.error("   - DB_NAME:", process.env.DB_NAME || "hostel_allotment");
        console.error("   - DB_SOCKET_PATH:", process.env.DB_SOCKET_PATH || "/tmp/mysql.sock");
      } else {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
};

// Export pool with error handling
export default pool;
