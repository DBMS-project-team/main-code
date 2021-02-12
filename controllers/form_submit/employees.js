const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
var fs = require("fs");

router.post('/add_new_cus_attribute', (req, res) => {
    const { attr_title } = req.body;
    db.query('INSERT INTO `custom_fields` SET ? ;', { custom_field_name: attr_title }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            // db.query('INSERT INTO `employee_additional_detail` SELECT emp_id,?,? FROM `employees`;', [result.insertId,attr_value], (error, result2) => {
            //     if(error) console.log('mysql error', error);
            //     else {
            res.json(result);
            //     }
            // })
        }
    })
});

router.post('/attr_value', (req, res) => {
    const { custom_field_id, attr_value } = req.body;
    db.query('INSERT INTO `custom_field_values` SET ? ;', { custom_field_id, custom_field_value: attr_value }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

module.exports = router;