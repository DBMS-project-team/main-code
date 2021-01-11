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

router.post('/addNewEmployee', ( req, res ) => {
    try {
        const {firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor} = req.body;
        db.query("INSERT INTO `employees`(`firstname`, `lastname`, `birthdate`, `martial_status`, `dept_id`, `job_id`, `emp_status_id`, `pay_grade_level`, `supervisor`) VALUES (?,?,?,?,?,?,?,?,?)",
            [firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor], 
            async (err,result) =>{
                if(err) console.log('error', error);
                else {
                    console.log(result);
                    if (req.body.userAccount){
                        const emp_id = result.insertId;
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
        const {empId,userAcc,firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor} = req.body;

        db.query('UPDATE `employees` SET `firstname`=?,`lastname`=?,`birthdate`=?,`martial_status`=?,`dept_id`=?,`job_id`=?,`emp_status_id`=?,`pay_grade_level`=?,`supervisor`=? WHERE emp_id=? ;', 
        [firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor,empId], (error, result) => {
            if(error) console.log('mysql error', error);
        })
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
