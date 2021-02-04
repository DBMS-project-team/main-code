const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');

router.get('/', (req, res)=>{
    db.query("select e.firstname, e.lastname, e.birthdate, e.martial_status, d.name, p.pay_grade_level_title, e.emp_id, u.emp_id user_id from employees as e inner join departments as d ON e.dept_id=d.dept_id inner join pay_grades as p ON e.pay_grade_level=p.pay_grade_level left join users as u ON e.emp_id=u.emp_id", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                result.forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees/', {employees: result});
            }
        }
    })
});

router.get('/edit/:emp_id/*', (req, res)=>{
    try{
        const emp_id = req.params.emp_id;
        db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where status=1 and emp_id != ? ;SELECT * FROM `user_levels`; SELECT c.custom_field_id,c.custom_field_name,d.custom_field_value,d.custom_field_id AS old_custom_field_id FROM `custom_fields` c LEFT JOIN (SELECT * FROM employee_additional_detail e WHERE emp_id=?) d ON c.custom_field_id=d.custom_field_id ; SELECT e.emp_id,e.firstname,e.lastname,concat(e.birthdate,'') as bd,e.martial_status,e.dept_id,e.job_id,e.emp_status_id,e.pay_grade_level,e.supervisor,u.username,u.user_level, u.emp_id AS userAcc FROM `employees` e LEFT JOIN `users` u on (e.emp_id=u.emp_id) WHERE e.emp_id=?", [emp_id,emp_id,emp_id],(error, result)=>{
            if(error) console.log('mysql error', error);
            else {
                res.render('employees/newEmployee',{result,newEmp:false});
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

module.exports = router;