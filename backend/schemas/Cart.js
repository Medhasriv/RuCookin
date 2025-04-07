const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
      unique: true
    },

    cartItems: [
      {
        _id: { type: String, required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        origin: { type: String }


      }
    ]
  },
  {
    collection: 'CartInfo',
    timestamps: true
  }
);

module.exports = mongoose.model("CartInfo", cartSchema);


//recipeUrl: { type: String } might use this later as a linked to recipeName 
