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
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      }
    ]
  },
  {
    collection: 'CartInfo'
  }
);

module.exports = mongoose.model("CartInfo", cartSchema);
