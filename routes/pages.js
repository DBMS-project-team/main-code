const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');
const feather = require('feather-icons');

var user = {
    name: "Pranavan",
    img:"/img/avatars/avatar.jpg"
}

router.get('/', (req, res)=>{
    res.render('home', {user});
});

router.use('/employees/', require('./pageRoutes/employees'));
router.use('/departments', require('./pageRoutes/departments'));
router.use('/menus', require('./pageRoutes/menus'));
router.use('/leaves', require('./pageRoutes/leaves'));
router.use('/settings', require('./pageRoutes/settings'));
router.use('/login', require('./pageRoutes/login'));
router.use('/profile', require('./pageRoutes/profile'));

/*router.get('/auth/login', (req, res)=>{
    res.send('normal')
})*/



router.get('/*', (req, res)=>{
    res.render('404',{url: req.originalUrl})
})
/*router.get('/*', (req, res)=>{
    res.render('.'+req.originalUrl)
})*/

module.exports = router;
