const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.use('/form_submit', require('../controllers/form_submit'));
router.use('/alter', require('../controllers/alter'));
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/login', (req, res)=>{
    res.send('auth login')
})

module.exports = router;