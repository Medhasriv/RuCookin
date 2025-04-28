const express = require('express');
const router = express.Router();
const { getUserIdFromToken } = require('../../utils/TokenDecoder');
require('../../schemas/User.js');
const User = require('mongoose').model('UserInfo');

router.get('/', async (req, res) => {
    try {
        const id = getUserIdFromToken(req);
        if (!id) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }
        const user = await User.findById(id).select('-password'); // Don't send back the password
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
