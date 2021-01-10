const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
});

db.connect( error=> {
    if(error)console.log(error);
    else console.log("mysql connected");
});

exports.register = (req, res)=>{
    const {username, password} = req.body;
    db.query('select username from users where username=?', [username], async (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result.length > 0 ){
                return res.render('register', {
                    message: 'That username is already in use'
                })
            }
            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword);
            db.query('insert into users set ?',{username: username, password: hashedPassword}, (error, result)=>{
                if(error) console.log(error);
                else{
                    console.log(result);
                    return res.render('register', {
                        message: 'User registered'
                    });
                }
            });
        }
    });
}
exports.login = async (req, res)=>{
    try {
        const {username, password, remember_me, url} = req.body;
        if( !username || !password ){
            return res.status(400).render('./logs/login', {
                error: 'Please provie an username and password'
            })
        }
        if(username === 'admin' ){
            db.query('select * from organization_details', async (error, result)=>{
                if(error) console.log('error', error);
                else if( !result || result.length < 1  ){
                    res.status(400).render('./logs/login', {
                        error: 'Cannot find the account'
                    })
                } else if ( result[0].admin_password !== password ) {
                    res.status(400).render('./logs/login', {
                        error: `${username}, your passowrd is incorrect `
                    })
                } else{
                    req.session.username = username;
                    req.session.admin = true;
                    req.session.user_id = result[0].org_id;
                    res.status(200).redirect(url);
                }
            })
        }else{
            db.query('select * from users where username=?',[username], async (error, result)=>{
                if(error) console.log('error', error);
                else{
                    /*if( !result || !(await bcrypt.compare(password, results[0].password) ) ){
                    res.status(401).render('login', {
                        message: 'username or password incorrect!'
                    });*/
                
                    /*const id = result[0].id;
                    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });
                    console.log('The token is '+token);
                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60
                        ),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookieOptions);
                    res.status(200).redirect('/');*/
                    req.session.username = username;
                    req.session.admin = false;
                    req.session.user_id = result[0].emp_id;
                    res.status(200).redirect(url);
                }
            })
        }
    } catch (error) {
        console.log(error);
    }
}
exports.logout = ( req, res ) => {
    req.session.destroy();
    res.redirect('/');
}

exports.addNewEnployee = ( req, res ) => {
    try {
        const {firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor} = req.body;
        db.query("INSERT INTO `employees`(`firstname`, `lastname`, `birthdate`, `martial_status`, `dept_id`, `job_id`, `emp_status_id`, `pay_grade_level`, `supervisor`) VALUES (?,?,?,?,?,?,?,?,?)",
            [firstname, lastname, dob, martialStatus, department, jobTitle, empStatus, payGlevel,supervisor], 
            async (err,result) =>{
                if(err) console.log('error', error);
                else {
                    console.log(result);
                    res.end();
                }
            });
    } catch (error) {
        console.log(error);
    }
}