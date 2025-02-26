const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

(async () => {
  const sql = neon(process.env.DATABASE_URL); 
  try {
    const result = await sql`SELECT 1 AS test_connection;`;
    console.log("Connection successful:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    sql.end();
  }
})();
