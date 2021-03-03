const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const bcrypt  = require('bcrypt');
const db = require('../db_config');

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
            let hashedPassword = await bcryptjs.hash(password, 8);
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
        if( !username ){
            return res.status(400).render('./logs/login', {
                error: 'Please provie an username',
                username_err: 'Please provide username',
                password_err: false
            })
        }else if(!password){
            return res.status(400).render('./logs/login', {
                error: 'Please provie password',
                username_err: false,
                password_err: 'Please provie password'
            })
        }
        if(username === 'admin' ){
            db.query('select * from organization_details', async (error, result)=>{
                if(error) console.log('error', error);
                else if( !result || result.length < 1  ){
                    res.status(400).render('./logs/login', {
                        error: 'Something went wrong!',
                        username_err: false,
                        password_err: false
                    })
                } else {
                    const is_user = await bcrypt.compare(password, result[0].admin_password);
                    if ( !is_user ) {
                        res.status(400).render('./logs/login', {
                            error: `${username}, your passowrd is incorrect`,
                            username_err: false,
                            password_err: 'Incorrect Password'
                        });
                    } else{
                        req.session.username = username;
                        req.session.admin = true;
                        req.session.emp_id = 0;
                        req.session.user_id = result[0].org_id;
                        req.session.user_level = 0;
                        res.status(200).redirect('/'+url);
                    }
                }
            })
        }else{
            db.query('select * from users where username=?',[username.trim()], async (error, result)=>{
                if(error) console.log('error', error);
                else{
                    /*if( !result || !(await bcryptjs.compare(password, results[0].password) ) ){
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
                    if(result.length > 0 ){
                        const is_user = await bcrypt.compare(password, result[0].password);
                        if(is_user){
                            req.session.username = username;
                            req.session.admin = false;
                            req.session.emp_id = result[0].emp_id;
                            req.session.user_id = result[0].emp_id;
                            req.session.user_level = result[0].user_level;
                            res.status(200).redirect('/'+url);
                        }
                        else {
                            res.status(400).render('./logs/login', {
                                error: `${username}, your password is incorrect `,
                                username_err: false,
                                password_err: 'Incorrect Password'
                            })
                        }
                    } else {
                        res.status(400).render('./logs/login', {
                            error: 'Cannot find the account',
                            username_err: 'Incorrect username',
                            password_err: false
                        })
                    }
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