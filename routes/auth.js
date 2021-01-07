const express = require('express');
const router = express.Router();
const authController = require('../constrollers/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/login', (req, res)=>{
    res.send('auth login')
})

module.exports = router;