// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const protect = require("../middleware/authMiddleware");
const Recipe = require("../models/Recipe");

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password, about } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = new User({ name, email, password, about });
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Respond with user data and token
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      about: newUser.about,
      token: token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Respond with user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      about: user.about,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      about: user.about,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch User Recipes
router.get("/recipes", protect, async (req, res) => {
  console.log("Fetching recipes for user:", req.user._id); // Log user ID
  try {
    const recipes = await Recipe.find({ createdBy: req.user._id });
    console.log("Recipes found:", recipes); // Log recipes
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error); // Log errors
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch a specific recipe by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
