const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');
const fs = require('fs');

router.get('/', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("select CONCAT(e.firstname,' ',e.lastname) fullname, e.birthdate, e.marital_status, e.emp_status_type, d.name, p.pay_grade_level_title, j.job_title_name, es.emp_status, e.emp_id from employees as e inner join departments as d ON e.dept_id=d.dept_id inner join pay_grades as p ON e.pay_grade_level=p.pay_grade_level left join users as u ON e.emp_id=u.emp_id inner join job_titles as j ON e.job_id=j.job_id inner join employment_statuses as es ON e.emp_status_id=es.emp_status_id where e.emp_id=?; select CONCAT(cf.custom_field_name,' : ', cfv.custom_field_value) custom_field from employee_additional_details as ead inner join custom_field_values as cfv ON ead.custom_field_value_id=cfv.custom_field_value_id inner join custom_fields as cf ON cfv.custom_field_id=cf.custom_field_id where ead.emp_id=?; select CONCAT(eci.eme_item_name, ' : ', ecd.eme_item_value) con_detail from emergency_contact_details as ecd inner join emergency_contact_items as eci ON ecd.eme_item_id=eci.eme_item_id where ecd.emp_id=?; SELECT CONCAT(es1.firstname,' ',es1.lastname) sup_name from supervisors as s1 inner join employees as es1 ON es1.emp_id=s1.supervisor WHERE s1.emp_id=?; SELECT CONCAT(es2.firstname,' ',es2.lastname) sub_names from employees es2 inner join supervisors as s2 ON es2.emp_id=s2.emp_id where s2.supervisor=?;", [emp_id,emp_id,emp_id,emp_id,emp_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            var res_1 = result[0];
            var res_2 = result[1];
            var res_3 = result[2];
            var res_4 = result[3];
            var res_5 = result[4];
            if( res_1.length > 0 ){
                res_1.forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                
            }
            
            if(fs.existsSync("public/img/profile/"+ emp_id +".jpg")){
                var image_url="img/profile/"+ emp_id +".jpg";
                var default_image=false;
            }else{
                var image_url="img/profile/default.jpg";
                var default_image=true;
            }

            res.render('profile/profile', {my_detail: res_1, cus_res: res_2, eme_res: res_3, sup_det: res_4, sub_det: res_5, emp_id: emp_id,image_url,default_image});
        }
    })
});

router.get('/editDetails', (req, res)=>{
    const emp_id = req.session.emp_id
    db.query("select username, firstname, lastname from employees_details WHERE emp_id=?;", [emp_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            console.table(result[0])
            res.render('profile/editDetails', {user: result});
            console.log(result)
        }
    })

});

router.get('/ChangePassword', (req, res)=>{
    res.render('profile/changePassword');
});

module.exports = router;