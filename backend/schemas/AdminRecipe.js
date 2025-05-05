const mongoose = require('mongoose');

const adminRecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    summary: {
      type: String,
    },
    readyInMin: {
      type: Number,
    },
    instructions: {
      type: String,
      required: true
    },
    ingredients: {
      type: [String],
      required: true
    },
    diets: {
      type: [String],
      enum: [
        "Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian", "Ovo-Vegetarian",
        "Vegan", "Pescetarian", "Paleo", "Primal", "Low FODMAP", "Whole30"
      ],
    },
    cuisines: {
      type: [String],
      enum: [
        "African", "Asian", "American", "British", "Cajun", "Caribbean", "Chinese",
        "Eastern European", "European", "French", "German", "Greek", "Indian", "Irish",
        "Italian", "Japanese", "Jewish", "Korean", "Latin American", "Mediterranean",
        "Mexican", "Middle Eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"
      ],
    }
  },
  {
    collection: 'adminRecipeInfo',

  }
);

module.exports = mongoose.model("adminRecipeInfo", adminRecipeSchema);