const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');

router.get('/login/new', (req, res)=>{
    res.render('login/new');
});

module.exports = router;