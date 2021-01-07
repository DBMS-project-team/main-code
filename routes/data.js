const express = require('express');
const router = express.Router();

const db = require('../db_config');

router.get('/', (req, res)=>{
    res.render('index', {user});
});
router.get('/employees', (req, res)=>{
    //res.json({id:"1"});
    db.query("select * from employees", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                res.json(result);
            }
        }
    })
});
router.get('/register', (req, res)=>{
    res.render('register');
});
router.get('/login', (req, res)=>{
    res.render('login');
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