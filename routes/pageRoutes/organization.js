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
                res.render('organization', {organization: result[0], branches: result[1]});
            }
        }
    })
});

router.get('/newOrg', (req, res)=>{
    res.render('newOrg', {org: true, branch: false, data: false, pass:false});

});

router.get('/editOrg/:org_id?', (req, res)=>{
    db.query("select * from organization_details where org_id=?;", [req.params.org_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newOrg', {org: true, branch: false, data: true, pass:false, org_detail: result[0]});
        }
    })
});

router.get('/orgChangePassword/:org_id?', (req, res)=>{
    db.query("select * from organization_details where org_id=?;", [req.params.org_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newOrg', {org: true, branch: false, data: true, pass:true, org_detail: result[0]});
        }
    })
});

router.get('/delOrg/:org_id?', (req, res)=>{
    db.query("delete From organization_details where org_id=?;", [req.params.org_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.get('/newBranch', (req, res)=>{
    res.render('newOrg', {org: false, branch: true, data: false});
 
});

router.get('/editBranch/:branch_id?', (req, res)=>{
    db.query("select * from branches where branch_id=?;", [req.params.branch_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newOrg', {org: false, branch: true, data: true, branch_det: result[0]});
        }
    })
});

router.get('/delBranch/:branch_id?', (req, res)=>{
    db.query("delete From branches where branch_id=?;", [req.params.branch_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});
module.exports = router