const mongoose = require("mongoose");

const banWordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
    },
    addedBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "banWordInfo",
  }
);

module.exports = mongoose.model("banWordInfo", banWordSchema);
