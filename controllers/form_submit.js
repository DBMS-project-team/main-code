const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');
var fs = require("fs");
const bcrypt = require('bcrypt');

router.use('/employees', require('./form_submit/employees'));
router.use('/menus', require('./form_submit/menus'));

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
    const { pay_grade_level, salary} = req.body; 
    db.query('INSERT INTO `pay_grades` SET ? ;', { pay_grade_level_title: pay_grade_level, salary: salary}, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/add_new_user_level_title', (req, res) => {
    db.query('INSERT INTO `user_levels` SET ?', {user_level_title: req.body.value}, (error, result) => {
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

router.post('/addNewEmployee', async ( req, res ) => {
    try {
        let {firstname, lastname, dob, staffId,martialStatus,address,phone, gender, department,branch,empStaType, jobTitle, empStatus, payGlevel,supervisor,attr_id,attr_val,profileImage} = req.body;
        console.log(attr_id,attr_val);
        var query="START TRANSACTION; SET @emp_id = NULL; INSERT INTO `employees`(`staff_id`, `firstname`, `lastname`, `birthdate`,`gender`, `marital_status`,`address`,`primary_phone_num`, `dept_id`,`branch_id`, `job_id`, `emp_status_id`,`emp_status_type`, `pay_grade_level`) VALUES (" + 
                    db.escape(staffId) +","+ db.escape(firstname)+","+ db.escape(lastname)+","+ db.escape(dob)+","+ db.escape(gender)+","+ db.escape(martialStatus)+","+ db.escape(address)+","+ db.escape(phone)+","+ db.escape(department)+","+ db.escape(branch)+","+ db.escape(jobTitle)+","+ db.escape(empStatus)+","+ db.escape(empStaType)+","+ db.escape(payGlevel)+"); SELECT last_insert_id() INTO @emp_id;";
        
        if (supervisor !=="0"){
            query +="INSERT INTO `supervisors`(`emp_id`, `supervisor`) VALUES ( @emp_id ,"+db.escape(supervisor)+ ");";

        }
        
        if(attr_id){
            var sub_query= "INSERT INTO `employee_additional_details` (`emp_id`, `custom_field_value_id` ) VALUES  ";
            if (attr_id.length==1){
                attr_id=[attr_id];
                attr_val=[attr_val];
            }
            for (var i = 0; i < attr_id.length; i++) {
                sub_query += "( @emp_id ,"+db.escape(attr_val[i]) +"),"
            }
            sub_query = sub_query.substring(0,sub_query.length-1) +";";
            query += sub_query;
            
        }
        if (req.body.userAccount){
            const username = req.body.userName;
            const user_level = req.body.userLevel;
            const password = "password";
            const hash_password = await bcrypt.hash(password, 10);
            query += "INSERT INTO `users`(`emp_id`, `username`, `user_level`, `password`) VALUES (@emp_id,"+ db.escape(username)+","+ db.escape(user_level)+","+ db.escape(hash_password)+");";
            
        }
        query += "COMMIT;";
        console.log(query);
        db.query(query,(err,result)=>{
            if (err) {
                console.log({err});
                res.json({error:true });
            }else{
                const emp_id=result[2].insertId
                if (profileImage !=="default"){
                    fs.writeFile("public\\img\\profile\\"+emp_id+".jpg", new Buffer.from(profileImage.split(",")[1], "base64"), 
                    function(imageWriteErr) {if(imageWriteErr) console.log(imageWriteErr);});
                }
                res.json({error:false,new:true,emp_id});
            }
        })
           
    } catch (error) {
        console.log(error);
    }
});

router.post('/editEmployee', async ( req, res ) => {
    try {
        let {empId,userAcc,firstname,staffId, lastname, dob, martialStatus,address,phone,gender, department,branch, jobTitle, empStatus,empStaType, payGlevel,supervisor,attr_id,exist_attr_id,attr_val,profileImage} = req.body;
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
        var query="START TRANSACTION; UPDATE `employees` SET `staff_id`="+db.escape(staffId)+", `firstname`="+db.escape(firstname)+",`lastname`="+db.escape(lastname)+",`birthdate`="+db.escape(dob)+",`marital_status`="+db.escape(martialStatus)+",`address`="+db.escape(address)+",`primary_phone_num`="+db.escape(phone)+
                    ",`gender`="+db.escape(gender)+",`dept_id`="+db.escape(department)+",`branch_id`="+ db.escape(branch)+",`job_id`="+db.escape(jobTitle)+",`emp_status_id`="+db.escape(empStatus)+",`emp_status_type`="+db.escape(empStaType)+",`pay_grade_level`="+db.escape(payGlevel)+" WHERE emp_id="+db.escape(empId)+" ;";
        
        if (supervisor !=="0"){
            query += "INSERT INTO supervisors (`emp_id`, `supervisor`) VALUES("+db.escape(empId)+","+db.escape(supervisor)+") ON DUPLICATE KEY UPDATE supervisor="+db.escape(supervisor)+";";
            
        }else{
            query += "DELETE FROM `supervisors` WHERE emp_id="+db.escape(empId)+";";
        }

        if(attr_id){
            var sub_query='';
            if (attr_id.length==1){
                attr_id=[attr_id];
                attr_val=[attr_val];
            }
            for (var i = 0; i < attr_id.length; i++) {
                if(exist_attr_id[i]=='0'){
                    sub_query += "INSERT INTO `employee_additional_details`(`emp_id`, `custom_field_value_id`) VALUES ("+db.escape(empId)+","+db.escape(attr_val[i])+");";
                }else{
                    sub_query +="UPDATE `employee_additional_details` SET `custom_field_value_id`="+db.escape(attr_val[i])+" WHERE `emp_id`="+db.escape(empId)+" AND`custom_field_value_id`="+db.escape(exist_attr_id[i])+";";
                }
                
            }
            query += sub_query;
        }
        
        if(req.body.userAccount){
            const username = req.body.userName;
            const user_level = req.body.userLevel;
            if(userAcc==""){
                const password = "password";
                const hash_password = await bcrypt.hash(password, 10);
                query += "INSERT INTO `users`(`emp_id`, `username`, `user_level`, `password`) VALUES ("+db.escape(empId)+","+db.escape(username)+","+db.escape(user_level)+","+db.escape(hash_password)+");";
            }else{
                query += "UPDATE `users` SET `username`="+db.escape(username)+",`user_level`="+db.escape(user_level)+" WHERE `emp_id`="+db.escape(empId)+";";
            }
        }else if(userAcc !=="") {
            query += "DELETE FROM `users` WHERE `emp_id`="+db.escape(empId)+";";
        }

        query += "COMMIT;";
        console.log(query);
        db.query(query,(err,result)=>{
            if (err) {
                console.log({err});
                res.json({error:true });
            }else{
                res.json({error:false,new:false,emp_id:empId});
            }
        })

    } catch (error) {
        console.log(error);
    }
});

router.post('/new_menu', (req, res) => {
    var values = {};
    var {title, href, icon, parent} = req.body;
    values.title = req.body.title;
    values.href = req.body.href;
    values.icon = req.body.icon;
    if( req.body.parent !== 'null' ) values.parent = req.body.parent;
    db.query('INSERT INTO `menus` SET ?', values, (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/edit_menu', (req, res) => {
    var values = {};
    var {title, href, icon, menu_id} = req.body;
    db.query('UPDATE menus SET title=?, href=?, icon=? where menu_id=?', [title, href, icon, menu_id], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json({status: 'ok'});
        }
    })
});

router.post('/add_new_leave_type', (req, res) => {
    db.query('INSERT INTO `leave_types` SET ?', {leave_type: req.body.value}, (error, result) => {
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
    var {leavetype,startdate,enddate,period} = req.body;
    var applydatetime = new Date();
    db.query("INSERT INTO `leave_applications`(`emp_id`, `apply_date_time`, `leave_type_id`,`leave_from`,`leave_to`, `period`, `status_id`) VALUES (?,?,?,?,?,?,?)", [emp_id, applydatetime,leavetype,startdate,enddate,period,1], (error, result) => {
        if(error) console.log('mysql error', error);
        else {
            res.json(result.insertId);
        }
    })
});

router.post('/editLeaveApplication', (req, res) => {
    const emp_id = req.session.emp_id;
    var {leave_id,startdate,enddate,period} = req.body;
    db.query('UPDATE leave_applications SET leave_from=?, leave_to=?, period=? where leave_id=?', [startdate, enddate, period, leave_id], (error, result) => {
        if(error) {
            console.log('mysql error', error);
        }else {
            res.json({status: 'ok'});
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

router.post('/changeOrgPassword', (req, res) => {
    var org_id = req.body.org_id;
    var new_pass = req.body.new_pass
    db.query('UPDATE organization_details SET admin_password=? where org_id=?', [new_pass, org_id], (error, result) => {
        if(error){
            console.log('mysql error', error);
        } 
        else {
            res.json({new:true});
        }
    })
});

router.post('/editOrg', (req, res) => {
    var {org_id, org_name, reg_num, org_address} = req.body;
    db.query('UPDATE organization_details SET org_name=?, registration_number=?, address=? where org_id=?', [org_name, reg_num, org_address, org_id], (error, result) => {
        if(error) {
            console.log('mysql error', error);
        }else {
            res.json({new:true});
        }
    })
});

router.post('/newBranch', (req, res) => {
    var {branch_name, branch_code, branch_lat, branch_lng, status} = req.body;
    db.query("INSERT INTO `branches`(`title`, `code`, `lat`, `lng`, `status`) VALUES (?,?,?,?,?)", [branch_name, branch_code, branch_lat, branch_lng, status], (error, result) => {
        if(error) {
            console.log('mysql error', error);
        }else {
            res.json({new:true});
        }
    })
});

router.post('/editBranch', (req, res) => {
    var {branch_id, branch_name,branch_code, branch_lat, branch_lng, status} = req.body;
    db.query('UPDATE branches SET title=?, code=?, lat=?, lng=?, status=? where branch_id=?', [branch_name,branch_code, branch_lat, branch_lng, status, branch_id], (error, result) => {
        if(error) {
            console.log('mysql error', error);
        }else {
            res.json({new:true});
        }
    })
});

module.exports = router;
