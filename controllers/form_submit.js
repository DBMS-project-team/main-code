const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');

router.post('/add_new_emp_status', (req, res) => {
    db.query('INSERT INTO `employment_statuses` SET ?', {emp_status: req.body.value}, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/add_new_department', (req, res) => {
    db.query('INSERT INTO `departments` SET ?', {name: req.body.value}, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

module.exports = router;
