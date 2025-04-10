const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
      unique: true
    },
    recipeId: {
        type: number,
        required: true,
      },
    
      noteText: {
        type: String,
        default: ""
      },
      noteDate: {
        type: Date,
        default: Date.now
      }
    },
    {
      collection: 'NoteInfo',
      timestamps: true
    }
);

module.exports = mongoose.model("NoteInfo", noteSchema);

