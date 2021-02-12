const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');

router.get('/', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("select CONCAT(e.firstname,' ',e.lastname) fullname, e.birthdate, e.martial_status, d.name, p.pay_grade_level_title, j.job_title_name, es.emp_status, e.emp_id from employees as e inner join departments as d ON e.dept_id=d.dept_id inner join pay_grades as p ON e.pay_grade_level=p.pay_grade_level left join users as u ON e.emp_id=u.emp_id inner join job_titles as j ON e.job_id=j.job_id inner join employment_statuses as es ON e.emp_status_id=es.emp_status_id where e.emp_id=?; select CONCAT(cf.custom_field_name,' : ', ead.custom_field_value) custom_field from custom_fields as cf inner join employee_additional_details as ead ON cf.custom_field_id=ead.custom_field_id where ead.emp_id=?; select CONCAT(ed.field_name, ' : ', ed.field_value) con_detail from emergency_contact_details as ed where ed.emp_id=?", [emp_id,emp_id,emp_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            var res_1 = result[0];
            var res_2 = result[1];
            var res_3 = result[2];
            if( res_1.length > 0 ){
                res_1.forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                
            }
            res.render('profile', {my_detail: res_1, cus_res: res_2, eme_res: res_3, emp_id: emp_id});
        }
    })
});

module.exports = router;