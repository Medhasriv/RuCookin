const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

router.get('/', async(req,res) => {
    try {
        const users = await User.find({}, { username: 1 });
        res.json(users);
    }
    catch(err) {
        res.status(500).json({error: 'Failed to ferch user'});
    }
});

route.put('/', async(req,res) => {
    const { username } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { username }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update username' });
    }

});

route.delete('/', async(req,res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Successfully deleted User' });;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }

});

module.exports = router;




