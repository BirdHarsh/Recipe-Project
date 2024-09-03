const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const corsOptions = {
  origin: "http://localhost:3000", // Frontend URL; update as needed
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable CORS with credentials (e.g., cookies, authorization headers)
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // Replaces bodyParser.json()

// Routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
