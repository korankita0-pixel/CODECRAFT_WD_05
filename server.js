
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Port for the local development server
const PORT = process.env.PORT || 3000;

// Parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Health-check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ConnectSphere server is running!",
        project: "CodeCraft Infotech Task 5"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log("------------------------------------");
    console.log(" ConnectSphere server is running");
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` Health:    http://localhost:${PORT}/api/health`);
    console.log("------------------------------------");
});
