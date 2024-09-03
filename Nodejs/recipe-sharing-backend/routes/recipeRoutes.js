const express = require("express");
const router = express.Router();
const path = require("path"); // Ensure you have the path module imported
const Recipe = require("../models/Recipe");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/")); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save files with unique names
  },
});

const upload = multer({ storage }); // Only configure once here

// Create a Recipe (protected route)
router.post("/", protect, upload.single("image"), async (req, res) => {
  const { title, ingredients, steps } = req.body;

  try {
    const newRecipe = new Recipe({
      title,
      image: req.file ? `/uploads/${req.file.filename}` : "", // Use relative path for serving
      ingredients: ingredients.split("\n"), // Handle arrays from strings
      steps: steps.split("\n"),
      createdBy: req.user._id, // User ID from the token
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error saving recipe:", error); // Log errors for debugging
    res.status(400).json({ error: error.message });
  }
});

// Get Recipes by User (protected route)

// Fetch all recipes
router.get("/", protect, async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("createdBy", "name");
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a Recipe (protected route)
router.put("/:recipeId", protect, upload.single("image"), async (req, res) => {
  const { recipeId } = req.params;
  const { title, ingredients, steps } = req.body;

  try {
    const recipe = await Recipe.findOne({
      _id: recipeId,
      createdBy: req.user._id,
    });

    if (!recipe) {
      return res
        .status(404)
        .json({ error: "Recipe not found or not authorized" });
    }

    // Update fields if provided
    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients.split("\n");
    if (steps) recipe.steps = steps.split("\n");
    if (req.file) recipe.image = `/uploads/${req.file.filename}`;

    await recipe.save();
    res.status(200).json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a Recipe (protected route)
router.delete("/:recipeId", protect, async (req, res) => {
  const { recipeId } = req.params;

  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: recipeId,
      createdBy: req.user._id,
    });

    if (!recipe) {
      return res
        .status(404)
        .json({ error: "Recipe not found or not authorized" });
    }

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
