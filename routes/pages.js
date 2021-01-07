const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');

var user = {
    name: "Pranavan",
    img:"/img/avatars/avatar.jpg"
}

router.get('/', (req, res)=>{
    res.render('home', {user});
});
router.get('/profile', (req, res)=>{
    res.render('profile');
});
router.get('/employees', (req, res)=>{
    db.query("select * from employees", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                result.forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees', {employees: result});
            }
        }
    })
});
router.get('/settings', (req, res)=>{
    res.render('settings');
});
router.get('/leave', (req, res)=>{
    res.render('leave');
});
router.get('/login/new', (req, res)=>{
    res.render('login/new');
});

/*router.get('/auth/login', (req, res)=>{
    res.send('normal')
})*/

router.get('/*', (req, res)=>{
    res.render('.'+req.originalUrl)
})

module.exports = router;