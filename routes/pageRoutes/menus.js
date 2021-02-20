const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
const feather = require('feather-icons');

router.get('/', (req, res)=>{
    db.query("select * from menus where parent is null;select * from menus where parent is not null;", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            if( result[0].length > 0 ){
                result[0].forEach((menu)=>{
                    var children = result[1].filter( m =>  m.parent === menu.menu_id);
                    if(children.length > 0 ) menu.children = children;
                    else menu.children = false;
                })
                res.render('menus/', {menus: result[0]});
            }else{
                res.status(500).send();
            }
        }
    })
});

router.get('/new/:parent?/:parent_title?', (req, res)=>{
    if(req.params.parent){
        res.render('menus/newMenu', {parent: req.params.parent, parent_title: req.params.parent_title, data: false});
    }else{
        res.render('menus/newMenu', {parent: false, icons: feather.icons, data: false});
    }
});

router.get('/edit/:menu_id/*', (req, res)=>{
    db.query("select * from menus where parent is null;select * from menus where menu_id=?;", [req.params.menu_id], (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('menus/newMenu', {icons: feather.icons, parents: result[0], data: result[1][0], parent : false});
        }
    })
});

router.get('/permissions', (req, res)=>{
    db.query("select * from pivoted_menu_permissions where parent is null;select * from pivoted_menu_permissions where parent IS NOT NULL;select * from user_levels", (error, result)=>{
        if(error) console.log('mysql error', error);
        else {
            res.render('menus/menuPermissions', {icons: feather.icons, data: result[0], sub_menus:result[1], userLevels: result[2]});
        }
    })
});

module.exports = router;