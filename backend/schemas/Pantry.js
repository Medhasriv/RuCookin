const mongoose = require("mongoose");

const pantrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
      unique: true,
    },
    items: [
      {
        id: Number,
        name: String,
        image: String,
        expirationDate: Date,
      },
    ],
  },
  {
    collection: "PantryInfo",
    timestamps: true,
  }
);

module.exports = mongoose.model("PantryInfo", pantrySchema);
