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
            res.json(result);
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

router.post('/add_new_emergency_attribute', (req, res) => {
    var {isRequired, isMultivalued }=req.body;
    const { name, isPersonal} = req.body; 
    isRequired = (isRequired == null)? 0 : 1;
    isMultivalued = (isMultivalued == null)? 0 : 1;
    db.query('INSERT INTO `emergency_contact_items` SET ? ;', { eme_item_name: name, personal: isPersonal, is_required: isRequired, multivalued: isMultivalued }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

module.exports = router;