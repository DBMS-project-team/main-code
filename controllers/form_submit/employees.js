const express = require('express');
const router = express.Router();
var dateFormat = require('dateformat');
const db = require('../../db_config');
var fs = require("fs");

router.post('/add_new_cus_attribute', (req, res) => {
    const { attr_title } = req.body;
    db.query('INSERT INTO `custom_fields` SET ? ;', { custom_field_name: attr_title }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

router.post('/attr_value', (req, res) => {
    const { custom_field_id, attr_value } = req.body;
    db.query('INSERT INTO `custom_field_values` SET ? ;', { custom_field_id, custom_field_value: attr_value }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

router.post('/add_new_emergency_attribute', (req, res) => {
    var {isRequired, isMultivalued }=req.body;
    const { name, isPersonal} = req.body; 
    isRequired = (isRequired == null)? 0 : 1;
    isMultivalued = (isMultivalued == null)? 0 : 1;
    db.query('INSERT INTO `emergency_contact_items` SET ? ;', { eme_item_name: name, personal: isPersonal, is_required: isRequired, multivalued: isMultivalued }, (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

router.post('/change_profile',(req, res)=>{
    const emp_id = req.session.emp_id;
    const {response,removeImage} = req.body;
    if(removeImage=="true"){
        fs.unlink("public\\img\\profile\\"+emp_id+".jpg", (delErr) => {
            if (delErr) console.log("image delete error",delErr);
            res.send("Image removed successfully.");
        });
    }else{
        fs.writeFile("public\\img\\profile\\"+emp_id+".jpg", new Buffer.from(response.split(",")[1], "base64"), 
        function(writeErr) {if(writeErr) console.log("write error",writeErr);});
        res.send("Image changed successfully.");
    }
    
});

router.post('/userEditDetails', (req, res) => {
    var {emp_id, user_name, first_name, last_name, password} = req.body;
    if(pass==password){
        db.query('UPDATE users SET username=?; UPDATE employees SET firstname=?, lastname=?', [user_name, first_name, last_name], (error, result) => {
            if(error) {
                console.log('mysql error', error);
            }else {
                res.json({new:true});
            }
        })
    }else{
        res.send("Incorrect Password")
    }
    
});

router.post('/userChangePassword', (req, res) => {
    var {emp_id, old_pass, curr_pass, new_pass, confirm_pass} = req.body;
    if(old_pass == curr_pass){
        if(new_pass == confirm_pass){
            db.query('UPDATE users SET password=? where emp_id=?', [new_pass, emp_id], (error, result) => {
                if(error){
                    console.log('mysql error', error);
                } 
                else {
                    res.json({new:true});
                }
            })
        }else{res.send("Incorrect Password")}
    }else{res.send("Incorrect Password")}
    
});

module.exports = router;
