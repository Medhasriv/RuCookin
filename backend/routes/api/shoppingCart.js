const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Cart= mongoose.model("CartInfo");

router.get('/', async (req, res) => {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userId = user._id;
      const cartItems = await CartItem.find({ userId });
      return res.status(200).json(cartItems);
  
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });


router.post ('/', async(req,rest) => {
    try {
        console.log("Incoming Request:", req.body)
        const { username, itemName, quantity, origin } = req.body;
        console.log("✅ Extracted Username:", username);
        console.log("✅ Extracted itemName:", itemName);
        console.log("✅ Extracted quantity:", quantity);
        console.log("✅ Extracted origin:", origin);
        const newItem = new CartItem({ itemName, quantity, origin });
        if (!username) {
            return res.status(400).json({ message: "Missing username" });
          }
      
          const user = await User.findOne({ username });
          if (!user) {
            console.log("User does not exist");
            return res.status(400).json({ message: "User not found" });
          }
          const userId = user._id;
          const newCart = {
            userId,
            newItem
          };
          await newCart.save();
          console.log("✅ New Cart Saved:", newCart);
          console.log("Cart saved successfully");
          return res.status(200).json({ message: "Cart saved successfully" });

        }
        catch(error) {
            console.error("Error saving Cart:", error);
            return res.status(500).json({ message: "Internal server error" });

        }
});

router.delete ('/', async(req,res)=> {
    try {
        const { username,CartItem } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userId = user._id;
      const cartItems = await CartItem.find({ userId });





    }


    catch(error) {
        onsole.error("Error deleting Cart:", error);
        return res.status(500).json({ message: "Internal server error" });

    }





});


