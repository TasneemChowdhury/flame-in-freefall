const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import MySQL connection pool
const db = require("./database/connection");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.json({
    message: "Flame in Freefall API is running",
    status: "success"
  });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend is healthy"
    });
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            status: "success",
            message: "Successfully connected to MySQL!",
            database_test: rows[0].result
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            status: "error",
            message: "Could not connect to the database."
        });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});