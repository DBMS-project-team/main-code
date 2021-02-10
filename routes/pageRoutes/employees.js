const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');
const fs = require("fs")

router.get('/', (req, res)=>{
    db.query("select * FROM employees_details;select * from custom_fields", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result[0].length > 0 ){
                result[0].forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees/', {employees: result[0], custom_fields: result[1]});
            }
        }
    })
});

router.get('/edit/:emp_id/*', (req, res)=>{
    try{
        const emp_id = req.params.emp_id;
        db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where status=1 and emp_id != ? ;SELECT * FROM `user_levels`; SELECT c.custom_field_id,c.custom_field_name,d.custom_field_value,d.custom_field_id AS old_custom_field_id FROM `custom_fields` c LEFT JOIN (SELECT * FROM employee_additional_detail e WHERE emp_id=?) d ON c.custom_field_id=d.custom_field_id ; SELECT e.emp_id,e.firstname,e.lastname,concat(e.birthdate,'') as bd,e.martial_status,e.dept_id,e.job_id,e.emp_status_id,e.pay_grade_level,e.supervisor,u.username,u.user_level, u.emp_id AS userAcc FROM `employees` e LEFT JOIN `users` u on (e.emp_id=u.emp_id) WHERE e.emp_id=?", [emp_id,emp_id,emp_id],
        (error, result)=>{
            if(error) console.log('mysql error', error);
            else {
                fs.readFile("public\\img\\profile\\"+result[7][0].emp_id+".jpg",{encoding: 'base64'}, function(err, image) {
                    if (err) imageData="default"; 
                    else{
                        imageData="data:image/png;base64,"+image
                    }
                    res.render('employees/newEmployee',{result,newEmp:false,imageData}); 
                  });
                
            } 
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/categories', (req, res)=>{
    db.query("select * from employment_statuses; select * from job_titles; select * from pay_grades;" , (error, data)=>{
        if(error) console.log('mysql error', error);
        if(!error) {
                var res_1=data[0]
                var res_2=data[1]
                var res_3=data[2]
                res.render('employees/categories', {empStatusRes: res_1, jobTitleRes: res_2, payGradesRes: res_3});
        }
    })
});

router.get('/newEmployee', (req, res)=>{
    db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where  status=1;SELECT * FROM `user_levels`;SELECT * FROM `custom_fields`;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('employees/newEmployee',{result, newEmp:true});
        } 
    })
});

router.get('/custom-attributes', (req, res)=>{
    db.query("SELECT * FROM `custom_fields`", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('employees/customAttributes',{cusAttr:result});
        } 
    })

});

router.get('/reports/:table?', (req, res)=>{
    console.log(req.params.table);
    db.query("select * FROM employees_details;select * from custom_fields;select dept_id id, name title from departments;select pay_grade_level id, pay_grade_level_title title from pay_grades;select job_id id, job_title_name title from job_titles;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result[0].length > 0 ){
                result[0].forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees/reports', {employees: result[0], custom_fields: result[1], rest_fields: result.slice(2)});
            }
        }
    })
});

module.exports = router;