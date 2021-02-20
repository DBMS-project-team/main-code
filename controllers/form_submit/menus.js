const express = require('express');
const router = express.Router();
const db = require('../../db_config');
var fs = require("fs");

router.post('/editMenuPermission', (req, res) => {
    const { menu_id, user_level, permission } = req.body;
    db.query('CALL updateMenuPermission(?, ?, ?);', [menu_id, user_level, permission], (error, result) => {
        if (error) console.log('mysql error', error);
        else {
            res.json(result);
        }
    })
});

module.exports = router;