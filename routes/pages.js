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
        db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` where emp_id != ? ;SELECT * FROM `user_levels`; SELECT c1.custom_field_name,c1.custom_field_id,c2.custom_field_value FROM `custom_fields` as c1 INNER JOIN `employee_additional_detail` c2 ON c1.custom_field_id=c2.custom_field_id WHERE c2.emp_id=?; SELECT e.emp_id,e.firstname,e.lastname,concat(e.birthdate,'') as bd,e.martial_status,e.dept_id,e.job_id,e.emp_status_id,e.pay_grade_level,e.supervisor,u.username,u.user_level, u.emp_id AS userAcc FROM `employees` e LEFT JOIN `users` u on (e.emp_id=u.emp_id) WHERE e.emp_id=?", [emp_id,emp_id,emp_id],(error, result)=>{
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
    db.query("select * from menus where parent is null;select * from menus where menu_id=?", req.params.menu_id, (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newMenu', {icons: feather.icons, parents: result[0], data: result[1][0], parent : false});
        }
    })
});

router.get('/settings', (req, res)=>{
    res.render('settings');
});
router.get('/leaves', (req, res)=>{
    res.render('leaves');
});
router.get('/leaves/my-applications', (req, res)=>{
    const emp_id = req.session.emp_id;
    res.render('myLeaveApplications', {emp_id});
});
router.get('/login/new', (req, res)=>{
    res.render('login/new');
});

/*router.get('/auth/login', (req, res)=>{
    res.send('normal')
})*/

router.get('/employees/newEmployee', (req, res)=>{
    db.query("SELECT * FROM `departments`;SELECT * FROM `job_titles`;SELECT * FROM `employment_statuses`;SELECT * FROM `pay_grades`;SELECT emp_id, concat(firstname,' ',lastname) as fullname FROM `employees` ;SELECT * FROM `user_levels`;SELECT * FROM `custom_fields`;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('newEmployee',{result, newEmp:true});
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

router.get('/*', (req, res)=>{
    res.render('.'+req.originalUrl)
})

module.exports = router;
