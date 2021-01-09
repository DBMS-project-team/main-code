const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

db.connect( error=> {
    if(error)console.log(error);
    else console.log("mysql connected");
});

module.exports = db;