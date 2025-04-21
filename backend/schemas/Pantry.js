const mongoose = require('mongoose');

const pantrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserInfo",
            required: true,
            unique: true
        },

        pantryItems: [
            {
                _id: { type: String, required: true },
                itemName: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                origin: { type: String },
                inPantry: { type: Boolean }
            }
        ]
    },
    {
        collection: 'PantryInfo',
        timestamps: true
    }
);

module.exports = mongoose.model("PantryInfo", pantrySchema);


//recipeUrl: { type: String } might use this later as a linked to recipeName 
