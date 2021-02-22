const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');
const fs = require("fs")

router.get('/actions', (req, res)=>{
    db.query("select * FROM employees_details;select * from custom_fields", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result[0].length > 0 ){
                result[0].forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees/actions', {employees: result[0], custom_fields: result[1]});
            }
        }
    })
});

router.get('/edit/:emp_id/*', (req, res)=>{
    try{
        const emp_id = req.params.emp_id;
        db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where status=1 and emp_id != ? ;SELECT * FROM `user_levels`; CALL employee_custom_attributes(?) ; SELECT e.emp_id,e.firstname,e.lastname,concat(e.birthdate,'') as bd,e.gender,e.marital_status,e.dept_id,e.job_id,e.emp_status_id,e.emp_status_type,e.pay_grade_level,s.supervisor,u.username,u.user_level, u.emp_id AS userAcc FROM `employees` e LEFT JOIN `users` u on (e.emp_id=u.emp_id) LEFT JOIN supervisors s on (s.emp_id=e.emp_id) WHERE e.emp_id=?", [emp_id,emp_id,emp_id],
        (error, result)=>{
            if(error) console.log('mysql error', error);
            else {
                fs.readFile("public\\img\\profile\\"+result[8][0].emp_id+".jpg",{encoding: 'base64'}, function(err, image) {
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
    db.query("select * from employment_statuses; select * from job_titles; select * from pay_grades; select * from user_levels;" , (error, data)=>{
        if(error) console.log('mysql error', error);
        if(!error) {
                var res_1=data[0]
                var res_2=data[1]
                var res_3=data[2]
                var res_4=data[3]
                res.render('employees/categories', {empStatusRes: res_1, jobTitleRes: res_2, payGradesRes: res_3, userLevelTitleRes: res_4});
        }
    })
});

router.get('/newPayGradeLevel', (req, res)=>{
        res.render('employees/newPayGradeLevel');
 
});

router.get('/newEmployee', (req, res)=>{
    db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where  status=1;SELECT * FROM `user_levels`;CALL custom_attributes();", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('employees/newEmployee',{result, newEmp:true});
        } 
    })
});

router.get('/custom-attributes', (req, res)=>{
    db.query("SELECT * FROM custom_fields; SELECT * FROM custom_field_values;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            var res_1 = result[0]
            var res_2 = result[1]
            res.render('employees/customAttributes',{cusAttr: res_1, cusVal: res_2});
        } 
    })

});

router.get('/emergency-contact', (req, res)=>{
    db.query("SELECT * FROM emergency_contact_items;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            var emerDetails = result;
            res.render('employees/emergency',{emerDetails});
        } 
    });
}); 

router.get('/newEmergency/:isPersonal?', (req, res)=>{
    const isPersonal = req.params.isPersonal;
    res.render('employees/newEmergency',{isPersonal});
 
});


router.get('/emergency_info/:emp_id/' ,(req,res) =>{
    const emp_id = req.params.emp_id;
    // var query='SELECT CONCAT("[",GROUP_CONCAT( JSON_OBJECT( "id", i.eme_item_id, "name", i.eme_item_name, "old_id",d.eme_item_id,"old_value",d.eme_item_value) ),"]") AS details FROM emergency_contact_items AS i LEFT OUTER JOIN emergency_contact_details AS d on (d.eme_item_id=i.eme_item_id AND d.emp_id=emp_id) GROUP BY i.is_required,i.multivalued;';
    db.query("CALL emergency_details(?)",[emp_id],(err,result)=>{
        if (err) console.log('mysql error', err);
        else {
            if(result[0].length==0){
                res.render("employees/editEmergencyDetails",{success:false});
            }else{
            var required=result[0][2] ? result[0][2].details:"[]";
            var required_multi=result[0][3] ? result[0][3].details:"[]";
            var optional=result[0][0] ? result[0][0].details:"[]";
            var optional_multi=result[0][1] ? result[0][1].details:"[]";
            res.render("employees/editEmergencyDetails",{required,required_multi,optional,optional_multi,emp_id,success:true});
            }
        }
    });
});

router.get('/:filter_type?/:table?/:attr?/:id?/:custom_field_id?', (req, res)=>{

    switch(req.params.filter_type){
        case 'default':
            var query = 'select * FROM employees_details where ?;';
            var para = {[req.params.table]:req.params.id};
            var page_para = {filter_type:'default', table:req.params.table,value:req.params.id, heading: `Showing results for ${req.params.attr}` };
            break;
        case 'custom':
            var query = 'select * FROM employees_details where ?;';
            var para = {['custom_field_'+req.params.custom_field_id+'_id']:req.params.id};
            var page_para = {filter_type:'custom', custom_field_id:req.params.custom_field_id,custom_field_value_id:req.params.id, heading: `Showing results for ${req.params.attr}`};
            break;
        default:
            var query = 'select * FROM employees_details;';
            var para = {};
            var page_para = {filter_type:'none', heading: 'Showing All results'};
    }
    db.query(query+"select * from custom_fields;select * from custom_field_values;select dept_id id, name title from departments;select pay_grade_level id, pay_grade_level_title title from pay_grades;select job_id id, job_title_name title from job_titles;", para, (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            console.log(para);
            if( true ){
                result[0].forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees/', {employees: result[0], custom_fields: result[1], custom_field_values: result[2] ,rest_fields: result.slice(3), page_para});
            }
        }
    })
});

module.exports = router;
