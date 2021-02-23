const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');
const errorHandler = require('../errorHandler');

router.get('/', (req, res)=>{
    db.query("SELECT concat(e.firstname, ' ', e.lastname, ' - ', s.title) title, l.apply_date_time, l.period FROM leave_applications l NATURAL JOIN employees e NATURAL JOIN leave_application_statuses s;", (error, result) => {
        if( error ) errorHandler(error);
        else {
            result.forEach( ele => {
                ele.start = dateFormat( ele.apply_date_time, 'isoDateTime' );
                const end = ele.apply_date_time;
                end.setDate(end.getDate() + ele.period)
                ele.end = dateFormat( end, 'isoDateTime' );
                ele.allDay = true;
            });
            res.render('leaves/', {leaves: result, now: dateFormat( Date(), 'isoDateTime' )});
        }
    })
});

router.get('/requests', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("SELECT l.emp_id,CONCAT(l.apply_date_time,'') AS datetime,l.period,CONCAT(e.firstname,' ',e.lastname) fullname,s.title AS status,lt.leave_type,d.name department,j.job_title_name jobtitle FROM leave_applications l INNER JOIN employees e ON l.emp_id=e.emp_id INNER JOIN leave_application_statuses s ON l.status_id=s.status_id INNER JOIN leave_types lt ON l.leave_type_id=lt.leave_type_id INNER JOIN departments d ON e.dept_id=d.dept_id INNER JOIN job_titles j ON e.job_id=j.job_id INNER JOIN supervisors su ON su.emp_id=e.emp_id WHERE e.status=1 and su.supervisor=? ORDER BY l.status_id,fullname",
        emp_id,(err,result) =>{
            if(err) console.log('mysql error', err );
            else {
                res.render('leaves/leave_requests',{result});
            }
        })
});

router.get('/settings',(req, res)=>{
    db.query("SELECT * FROM `leave_types`;select * from pivoted_max_leave_days;select * from pay_grades;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else{
            res.render('leaves/leave_settings',{leave_type_res: result[0], max_leave_res:result[1], pay_grades: result[2]});
        }
    })
});

router.get('/new_max_leave/:parent?/:parent_title?', (req, res)=>{
    db.query("SELECT * FROM `leave_types`;SELECT * FROM `pay_grades`;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            var res_1=result[0];
            var res_2=result[1];     
            res.render('leaves/new_max_leave', {data: false, leave_type_res:res_1, pay_gr_res:res_2});
            
        } 
    })
    
});

router.get('/my-applications', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("select t.leave_type,a.apply_date_time,a.period,s.title from leave_applications as a inner join leave_application_statuses as s ON a.status_id=s.status_id inner join leave_types as t ON a.leave_type_id=t.leave_type_id where emp_id=?",[emp_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                result.forEach( row => {
                    row.formatted_date_time = row.apply_date_time !== null ? dateFormat( row.apply_date_time, 'dddd, mmmm dS, yyyy' ) : '';
                    row.apply_date_time     = row.apply_date_time !== null ? dateFormat( row.apply_date_time, 'yy-mm-dd HH:MM:ss' ) : '';
                })
            }
            res.render('leaves/myLeaveApplications', {emp_id,applications: result});
        }
    })
});

router.get('/newApplication', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("SELECT * FROM `leave_types`", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('leaves/newLeaveApplication',{emp_id,types: result});
        } 
    })
});

module.exports = router;
