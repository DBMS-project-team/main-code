const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');
var fs = require("fs");

router.use('/employees', require('./form_submit/employees'));

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


router.post('/addNewEmployee', ( req, res ) => {
    try {
        let {firstname, lastname, dob, martialStatus,gender, department,empStaType, jobTitle, empStatus, payGlevel,supervisor,attr_id,attr_val,profileImage} = req.body;
        console.log(attr_id,attr_val);
        db.query("INSERT INTO `employees`(`firstname`, `lastname`, `birthdate`,`gender`, `marital_status`, `dept_id`, `job_id`, `emp_status_id`,`emp_status_type`, `pay_grade_level`) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [firstname, lastname, dob,gender, martialStatus, department, jobTitle, empStatus,empStaType, payGlevel], 
            async (err,result) =>{
                if(err) console.log('error', err);
                else {
                    const emp_id = result.insertId;
                    if (supervisor !=="0"){
                        db.query("INSERT INTO `supervisors`(`emp_id`, `supervisor`) VALUES (?,?);",[emp_id,supervisor],
                        (err2) =>{
                            if(err2) console.log('error', err2);
                        });

                    }
                    if (profileImage !=="default"){
                        fs.writeFile("public\\img\\profile\\"+emp_id+".jpg", new Buffer.from(profileImage.split(",")[1], "base64"), 
                        function(imageWriteErr) {if(imageWriteErr) console.log(imageWriteErr);});
                    }
                    if(attr_id){
                        var valueArray=[];
                        if (attr_id.length==1){
                            attr_id=[attr_id];
                            attr_val=[attr_val];
                        }
                        for (var i = 0; i < attr_id.length; i++) {
                            valueArray.push([emp_id,attr_val[i]]);
                          }
                        db.query("INSERT INTO `employee_additional_details`(`emp_id`, `custom_field_value_id` ) VALUES ?",[valueArray], async (error,result2) =>{
                            if(error) console.log('error', error);
                        })
                    }
                    if (req.body.userAccount){
                        const username = req.body.userName;
                        const user_level = req.body.userLevel;
                        const password = "password";

                        db.query('INSERT INTO `users`(`emp_id`, `username`, `user_level`, `password`) VALUES (?,?,?,?);', [emp_id,username,user_level,password], (error, result) => {
                            if(error) console.log('mysql error', error);
                        });
                    }
                    res.json({new:true,emp_id});
                }
            });
    } catch (error) {
        console.log(error);
    }
});

router.post('/editEmployee', ( req, res ) => {
    try {
        let {empId,userAcc,firstname, lastname, dob, martialStatus,gender, department, jobTitle, empStatus,empStaType, payGlevel,supervisor,attr_id,exist_attr_id,attr_val,profileImage} = req.body;
        console.log(attr_id,exist_attr_id,attr_val);
        if(profileImage !== "unchanged"){
            if (profileImage=="default"){
                fs.unlink("public\\img\\profile\\"+empId+".jpg", (delErr) => {
                    if (delErr) console.log("image delete error",delErr);
                });
            }else{
                fs.writeFile("public\\img\\profile\\"+empId+".jpg", new Buffer.from(profileImage.split(",")[1], "base64"), 
                function(writeErr) {if(writeErr) console.log("write error",writeErr);});
            }
        }
        db.query('UPDATE `employees` SET `firstname`=?,`lastname`=?,`birthdate`=?,`marital_status`=?,`gender`=?,`dept_id`=?,`job_id`=?,`emp_status_id`=?,`emp_status_type`=?,`pay_grade_level`=? WHERE emp_id=? ;', 
        [firstname, lastname, dob, martialStatus,gender, department, jobTitle, empStatus,empStaType, payGlevel,empId], (error, result) => {
            if(error) console.log('mysql error', error);
        })

        if (supervisor !=="0"){
            db.query("INSERT INTO supervisors (`emp_id`, `supervisor`) VALUES(?,?) ON DUPLICATE KEY UPDATE supervisor=?;",[empId,supervisor,supervisor],
            (err2) =>{
                if(err2) console.log('error', err2);
            });
        }else{
            db.query("DELETE FROM `supervisors` WHERE emp_id=?;",[empId],
            (err3) =>{
                if(err3) console.log('error', err3);
            });
        }

        if(attr_id){
            var valueArray=[];
            var query='';
            if (attr_id.length==1){
                attr_id=[attr_id];
                attr_val=[attr_val];
            }
            for (var i = 0; i < attr_id.length; i++) {
                if(exist_attr_id[i]=='0'){
                    query += "INSERT INTO `employee_additional_details`(`emp_id`, `custom_field_value_id`) VALUES (?,?);";
                    valueArray.push(empId,attr_val[i]);
                }else{
                    query +="UPDATE `employee_additional_details` SET `custom_field_value_id`=? WHERE `emp_id`=? AND`custom_field_value_id`=?;";
                    valueArray.push(attr_val[i],empId,exist_attr_id[i]);
                }
                
              }
            db.query(query,valueArray, async (err,result2) =>{
                if(err) console.log('error', err);
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
        res.json({new:false,emp_id:empId});
    } catch (error) {
        console.log(error);
    }
});
router.post('/edit_menu', (req, res) => {
    var values = {};
    var {title, href, icon} = req.body;
    db.query('UPDATE menus SET title=?, href=?, icon=?', [title, href, icon], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json({status: 'ok'});
        }
    })
});

router.post('/add_new_leave_type', (req, res) => {
    db.query('INSERT INTO `leave_types` SET ?', {name: req.body.value}, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/new_max_leave', (req, res) => {
    var values = {};
    var {leave_type, pay_grade_level_title, max_leaves} = req.body;
    
    values.leave_type_id = req.body.leave_type;
    values.pay_grade_level = req.body.pay_grade_level_title;
    values.no_of_leaves = req.body.max_leaves;
    db.query('INSERT INTO `max_leave_days` SET ?', values, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    });
        
    
});

router.post('/addNewLeaveApplication', (req, res) => {
    const emp_id = req.session.emp_id;
    const applydatetime = dateFormat( req.body.applydatetime, 'yyyy-mm-dd HH:mm:ss' );
    db.query("INSERT INTO `leave_applications`(`emp_id`, `apply_date_time`, `leave_type_id`, `period`, `status_id`) VALUES (?,?,?,?,?)", [emp_id, applydatetime,req.body.leavetype,req.body.period,1], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/menuCheckUpdate', (req, res) => {
    console.log('yes');
    var arr = req.body;
    var perm = arr[0];
    var user_level = arr[1];
    var menu_id= arr[2];
    console.log(perm,user_level, menu_id);
    db.query("UPDATE `menu_permissions` SET `permission` = ? WHERE `menu_permissions`.`user_level` = ? AND `menu_permissions`.`menu_id` = ?;", { perm, user_level, menu_id }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});


router.post('/addEmergencyDetails', (req,res)=>{
    let { array,deleted,emp_id }=req.body;
    deleted=deleted ? deleted:[]; 
    var insert=[];
    var update_sql="";

    for (var i=0;i < array.length ; i++){
        if (array[i][1]==""){
            if (array[i][2] !==""){
                insert.push([emp_id,array[i][0],array[i][2]]);
            }
        }
        else{
            if (array[i][2]==""){
                deleted.push([array[i][0],array[i][1]])
            }else if(array[i][1] !== array[i][2]){
                update_sql +="UPDATE `emergency_contact_details` SET `eme_item_value`="+db.escape(array[i][2])+"  WHERE `emp_id`="+db.escape(emp_id)+" AND`eme_item_id`="+db.escape(array[i][0])+" AND `eme_item_value`="+db.escape(array[i][1])+" ;";
            }
        }
    }
    if (insert.length > 0){
        db.query("INSERT INTO `emergency_contact_details`(`emp_id`, `eme_item_id`, `eme_item_value`) VALUES ?",[insert],(error,result)=>{
            if(error) console.log('mysql error', error);
            else {
                console.log(result);
            }
        })
    }
    if (update_sql !== ""){
        db.query(update_sql,(error2,result2)=>{
            if(error2) console.log('mysql error', error2);
            else {
                console.log(result2);
            }
        })
    }

    var del_query="";
    if (deleted.length >0){
        for (var i=0; i<deleted.length ; i++){
            del_query +="DELETE FROM `emergency_contact_details` WHERE  `emp_id`="+db.escape(emp_id)+" AND `eme_item_id`="+db.escape(deleted[i][0])+" AND `eme_item_value`="+db.escape(deleted[i][1])+" ;"; 
        }

        db.query(del_query,(error3,result3)=>{
            if(error3) console.log('mysql error', error3);
            else {
                console.log(result3);
            }
        })
    }
    res.end();
});

module.exports = router;
