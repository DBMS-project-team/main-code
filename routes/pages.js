const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../db_config');
const feather = require('feather-icons')

var user = {
    name: "Pranavan",
    img:"/img/avatars/avatar.jpg"
}

router.get('/', (req, res)=>{
    res.render('home', {user});
});
router.get('/profile', (req, res)=>{
    res.render('profile');
});
router.get('/employees', (req, res)=>{
    db.query("select e.firstname, e.lastname, e.birthdate, e.martial_status, d.name, p.pay_grade_level_title, e.emp_id, u.emp_id user_id from employees as e inner join departments as d ON e.dept_id=d.dept_id inner join pay_grades as p ON e.pay_grade_level=p.pay_grade_level left join users as u ON e.emp_id=u.emp_id", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                result.forEach( row => {
                    row.birthdate = row.birthdate !== null ? dateFormat( row.birthdate, 'dddd, mmmm dS, yyyy' ) : ''
                })
                res.render('employees', {employees: result});
            }
        }
    })
});

router.get('/employees/edit/:emp_id/*', (req, res)=>{
    try{
        const emp_id = req.params.emp_id;
        db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where status=1 and emp_id != ? ;SELECT * FROM `user_levels`; SELECT c.custom_field_id,c.custom_field_name,d.custom_field_value,d.custom_field_id AS old_custom_field_id FROM `custom_fields` c LEFT JOIN (SELECT * FROM employee_additional_detail e WHERE emp_id=?) d ON c.custom_field_id=d.custom_field_id ; SELECT e.emp_id,e.firstname,e.lastname,concat(e.birthdate,'') as bd,e.martial_status,e.dept_id,e.job_id,e.emp_status_id,e.pay_grade_level,e.supervisor,u.username,u.user_level, u.emp_id AS userAcc FROM `employees` e LEFT JOIN `users` u on (e.emp_id=u.emp_id) WHERE e.emp_id=?", [emp_id,emp_id,emp_id],(error, result)=>{
            if(error) console.log('mysql error', error);
            else {
                res.render('newEmployee',{result,newEmp:false});
            } 
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/employees/categories', (req, res)=>{
    db.query("select * from employment_statuses; select * from job_titles; select * from pay_grades;" , (error, data)=>{
        if(error) console.log('mysql error', error);
        if(!error) {
                var res_1=data[0]
                var res_2=data[1]
                var res_3=data[2]
                res.render('categories', {empStatusRes: res_1, jobTitleRes: res_2, payGradesRes: res_3});
        }
    })
});

router.get('/departments', (req, res)=>{
    db.query("select * from departments", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                res.render('departments', {departments: result});
            }
        }
    })
});

router.get('/menus', (req, res)=>{
    db.query("select * from menus where parent is null;select * from menus where parent is not null;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result[0].length > 0 ){
                result[0].forEach((menu)=>{
                    var children = result[1].filter( m =>  m.parent === menu.menu_id);
                    if(children.length > 0 ) menu.children = children;
                    else menu.children = false;
                })
                console.log(result[0])
                res.render('menus', {menus: result[0]});
            }
        }
    })
});

router.get('/menus/new/:parent?/:parent_title?', (req, res)=>{
    if(req.params.parent){
        res.render('newMenu', {parent: req.params.parent, parent_title: req.params.parent_title, data: false});
    }else{
        res.render('newMenu', {parent: false, icons: feather.icons, data: false});
    }
});

router.get('/menus/edit/:menu_id/*', (req, res)=>{
    db.query("select * from menus where parent is null;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newMenu', {icons: feather.icons, parents: result[0], data: result[1][0], parent : false});
        }
    })
});

router.get('/menus/permissions', (req, res)=>{
    db.query("select * from menus where parent is null;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('menuPermissions', {icons: feather.icons, parents: result[0], data: result[1][0], parent : false});
        }
    })
});

router.get('/settings', (req, res)=>{
    res.render('settings');
});

router.get('/login/new', (req, res)=>{
    res.render('login/new');
});

/*router.get('/auth/login', (req, res)=>{
    res.send('normal')
})*/

router.get('/employees/newEmployee', (req, res)=>{
    db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where  status=1;SELECT * FROM `user_levels`;SELECT * FROM `custom_fields`;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newEmployee',{result, newEmp:true});
        } 
    })
});

router.get('/leaves/requests', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("SELECT l.emp_id,CONCAT(l.apply_date_time,'') datetime,l.period,CONCAT(e.firstname,' ',e.lastname) fullname,s.title status,lt.leave_type,d.name department,j.job_title_name jobtitle FROM leave_applications l INNER JOIN employees e ON l.emp_id=e.emp_id INNER JOIN leave_application_statuses s ON l.status_id=s.status_id INNER JOIN leave_types lt ON l.leave_type_id=lt.leave_type_id INNER JOIN departments d ON e.dept_id=d.dept_id INNER JOIN job_titles j ON e.job_id=j.job_id  WHERE e.status=1 and e.supervisor=? ORDER BY l.status_id,fullname;",
        emp_id,(err,result) =>{
            if(err) console.log('mysql error', err );
            else {
                res.render('leave_requests',{result});
            }
        })
});

router.get('/employees/custom-attributes', (req, res)=>{
    db.query("SELECT * FROM `custom_fields`", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('customAttributes',{cusAttr:result});
        } 
    })

});

router.get('/leaves', (req, res)=>{
    res.render('leaves');
});

router.get('/leaves/settings',(req, res)=>{
    db.query("SELECT * FROM `leave_types`;SELECT lt.*, pg.*, mld.* FROM `max_leave_days` as mld inner join `leave_types` as lt ON mld.leave_type_id=lt.leave_type_id inner join `pay_grades` as pg ON mld.pay_grade_level=pg.pay_grade_level", (error, result)=>{
        if(error) console.log('mysql error', error);
        else{
            var res_1=result[0];
            var res_2=result[1];
            res.render('leave_settings',{leave_type_res:res_1, max_leave_res:res_2});
        }
    })
});

router.get('/leaves/new_max_leave/:parent?/:parent_title?', (req, res)=>{
    db.query("SELECT * FROM `leave_types`;SELECT * FROM `pay_grades`;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            var res_1=result[0];
            var res_2=result[1];     
            res.render('new_max_leave', {data: false, leave_type_res:res_1, pay_gr_res:res_2});
            
        } 
    })
    
});

router.get('/leaves/my-applications', (req, res)=>{
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
            res.render('myLeaveApplications', {emp_id,applications: result});
        }
    })
});

router.get('/leaves/newApplication', (req, res)=>{
    const emp_id = req.session.emp_id;
    db.query("SELECT * FROM `leave_types`", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newLeaveApplication',{emp_id,types: result});
        } 
    })
});

router.get('/*', (req, res)=>{
    res.render('404',{url: req.originalUrl})
})
/*router.get('/*', (req, res)=>{
    res.render('.'+req.originalUrl)
})*/

module.exports = router;
