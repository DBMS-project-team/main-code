const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const mysql = require('mysql');
const db = require('../db_config');

router.post('/delete', (req, res) => {
    const {table, column, id} = req.body;
    //db.query('DELETE FROM ?? where ?? = ?', [table, column, id], (error, result) => {
        if( typeof column !== 'object' ) var argument = {[column]:id};
        else {
            column.forEach( (value, i) => {
                argument[value] = column[i]
            } );
        }
    db.query('DELETE FROM ?? WHERE ?', [table, argument], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});
router.post('/del_custom_attribute', (req, res) => {
    const {id} = req.body;
    db.query('DELETE FROM `employee_additional_detail` WHERE custom_field_id=?;DELETE FROM `custom_fields` WHERE custom_field_id=?;', [id,id], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});
router.post('/edit', (req, res) => {
    var {table, column, id,  value, changed_column} = req.body;
    if( typeof column !== 'undefined' ) {
        //var argument = {[column]:id};
        column = column.split(',');
        id = id.split(',');
        var string = '1';
        column.forEach( (value, i) => {
            string += ` and ${mysql.escapeId( value.trim() )} = ${mysql.escape( id[i].trim() )}`;
        } );
        var argument = { toSqlString: function() { return string; } };
    } else {
        const column = req.body['column[]'];
        const id = req.body['id[]'];
        var string = '1';
        column.forEach( (value, i) => {
            string += ` and ${mysql.escapeId( value )} = ${mysql.escape( id[i] )}`;
        } );
        var argument = { toSqlString: function() { return string; } };
    }
    var query = db.query('UPDATE ?? SET ?? = ? WHERE ?', [table, changed_column, value, argument], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    });
    console.log(query.sql)
});

router.post('/leave_approval', (req, res) => {
    const {empId,dateTime,status} = req.body;
    db.query('UPDATE `leave_applications` SET  status_id=? WHERE `emp_id`=? and `apply_date_time`=?;', [status,empId,dateTime], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

module.exports = router;
