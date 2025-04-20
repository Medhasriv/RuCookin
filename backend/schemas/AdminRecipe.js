const mongoose = require('mongoose');

const adminRecipeSchema = new mongoose.Schema(
  {
    recipeId: {
        type: String, 
        required: true
      },
    
      title: {
        type: String,
        required: true
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
      },
      cuisines: {
        type: [String],
      }  
    },
    {
      collection: 'adminRecipeInfo',

    }
);

module.exports = mongoose.model("adminRecipeInfo", adminRecipeSchema);

