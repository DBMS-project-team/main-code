const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');

router.get('/', (req, res)=>{
    db.query("select * from organization_details;select * from branches", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                res.render('organization', {organization: result[0][0], branches: result[1]});
            }
        }
    })
});

module.exports = router