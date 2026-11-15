const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import the server-side Supabase client
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
        const { error } = await db
            .from("investigations")
            .select("id")
            .limit(1);

        if (error) {
            throw error;
        }

        res.json({
            status: "success",
            message: "Successfully connected to Supabase!",
            database_test: "ok"
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