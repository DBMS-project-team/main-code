const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');

router.get('/', (req, res)=>{
    db.query("select * from departments", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                res.render('departments', {departments: result});
            }
        }
    })
});

module.exports = router