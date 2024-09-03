// models/Recipe.js
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  ingredients: { type: [String], required: true },
  steps: { type: [String], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recipe", recipeSchema);
