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

router.post('/add_new_job_title', (req, res) => {
    db.query('INSERT INTO `job_titles` SET ?', {job_title_name: req.body.value}, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/add_new_pay_grade_level', (req, res) => {
    db.query('INSERT INTO `pay_grades` SET ?', {pay_grade_level_title: req.body.value}, (error, result) => {
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

router.post('/add_new_cus_attribute', (req, res) => {
    const {attr_title, attr_value} =req.body;
    db.query('INSERT INTO `custom_fields` SET ? ;', {custom_field_name:attr_title}, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            db.query('INSERT INTO `employee_additional_detail` SELECT emp_id,?,? FROM `employees`;', [result.insertId,attr_value], (error, result2) => {
                if(error) console.log('mysql error', error);
                else {
                    res.json(result);
                }
            })
        }
    })
});

router.post('/addNewEmployee', ( req, res ) => {
    try {
        let {firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor,attr_id,attr_val} = req.body;
        db.query("INSERT INTO `employees`(`firstname`, `lastname`, `birthdate`, `martial_status`, `dept_id`, `job_id`, `emp_status_id`, `pay_grade_level`, `supervisor`) VALUES (?,?,?,?,?,?,?,?,?)",
            [firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor], 
            async (err,result) =>{
                if(err) console.log('error', error);
                else {
                    const emp_id = result.insertId;
                    if(attr_id){
                        var valueArray=[];
                        if (attr_id.length==1){
                            attr_id=[attr_id];
                            attr_val=[attr_val];
                        }
                        for (var i = 0; i < attr_id.length; i++) {
                            valueArray.push([emp_id,attr_id[i],attr_val[i]]);
                          }
                        db.query("INSERT INTO `employee_additional_detail`(`emp_id`, `custom_field_id`, `custom_field_value`) VALUES ?",[valueArray], async (err,result2) =>{
                            if(err) console.log('error', error);
                        })
                    }
                    if (req.body.userAccount){
                        const username = req.body.userName;
                        const user_level = req.body.userLevel;
                        const password = "password";

                        db.query('INSERT INTO `users`(`emp_id`, `username`, `user_level`, `password`) VALUES (?,?,?,?);', [emp_id,username,user_level,password], (error, result) => {
                            if(error) console.log('mysql error', error);
                            else {
                                res.end();
                            }
                        });
                    }else{
                        res.end();
                    }
                }
            });
    } catch (error) {
        console.log(error);
    }
});

router.post('/editEmployee', ( req, res ) => {
    try {
        let {empId,userAcc,firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor,attr_id,attr_val} = req.body;

        db.query('UPDATE `employees` SET `firstname`=?,`lastname`=?,`birthdate`=?,`martial_status`=?,`dept_id`=?,`job_id`=?,`emp_status_id`=?,`pay_grade_level`=?,`supervisor`=? WHERE emp_id=? ;', 
        [firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor,empId], (error, result) => {
            if(error) console.log('mysql error', error);
        })

        if(attr_id){
            var valueArray=[];
            var query='';
            if (attr_id.length==1){
                attr_id=[attr_id];
                attr_val=[attr_val];
            }
            for (var i = 0; i < attr_id.length; i++) {
                query +="UPDATE `employee_additional_detail` SET `custom_field_value`=? WHERE `emp_id`=? AND`custom_field_id`=?;";
                valueArray.push(attr_val[i],empId,attr_id[i]);
              }
            db.query(query,valueArray, async (err,result2) =>{
                if(err) console.log('error', error);
            })
        }

        if(req.body.userAccount){
            const username = req.body.userName;
            const user_level = req.body.userLevel;
            if(userAcc==""){
                const password = "password";
                db.query('INSERT INTO `users`(`emp_id`, `username`, `user_level`, `password`) VALUES (?,?,?,?);', [empId,username,user_level,password], (error, result) => {
                    if(error) console.log('mysql error', error);
                });
            }else{
                db.query('UPDATE `users` SET `username`=?,`user_level`=? WHERE `emp_id`=?', [username,user_level,empId], (error, result) => {
                    if(error) console.log('mysql error', error);
                });
            }
        }else if(userAcc !=="") {
            db.query('DELETE FROM `users` WHERE `emp_id`=?', [empId], (error, result) => {
                if(error) console.log('mysql error', error);
            });
        }
        res.end();
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
