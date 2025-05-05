const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
      unique: true
    },
    cuisineLike: {
      type: [String],
      enum: [
        "African", "Asian", "American", "British", "Cajun", "Caribbean", "Chinese",
        "Eastern European", "European", "French", "German", "Greek", "Indian", "Irish",
        "Italian", "Japanese", "Jewish", "Korean", "Latin American", "Mediterranean",
        "Mexican", "Middle Eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"
      ],
      default: []
    },
    cuisineDislike: {
      type: [String],
      enum: [
        "African", "Asian", "American", "British", "Cajun", "Caribbean", "Chinese",
        "Eastern European", "European", "French", "German", "Greek", "Indian", "Irish",
        "Italian", "Japanese", "Jewish", "Korean", "Latin American", "Mediterranean",
        "Mexican", "Middle Eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"
      ],
      default: []
    },
    diet: {
      type: [String],
      enum: [
        "Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian", "Ovo-Vegetarian",
        "Vegan", "Pescetarian", "Paleo", "Primal", "Low FODMAP", "Whole30"
      ],
      default: []
    },
    intolerance: {
      type: [String],
      enum: [
        "Dairy", "Egg", "Gluten", "Grain", "Peanut", "Seafood", "Sesame", "Shellfish",
        "Soy", "Sulfite", "Tree Nut", "Wheat"
      ],
      default: []
    },
    favoriteRecipes: {
      type: [Number], // Spoonacular recipe IDs are numerical
      default: []
    }
  },
  {  // <-- FIXED: Added comma here
    collection: "UserPreferences"
  }
);

module.exports = mongoose.model("UserPreferences", preferenceSchema);