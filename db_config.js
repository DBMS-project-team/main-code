const mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit     : 10,
    host                : process.env.DB_HOST,
    user                : process.env.DB_USER,
    password            : process.env.DB_PASSWORD,
    database            : process.env.DATABASE,
    multipleStatements  : true
});

db.on('connection', function (connection) {
    console.log('MySql Connected Connection id - %d', connection.threadId);
});

// pool.getConnection(function(err, connection) {
//     if (err) throw err; // not connected!
   
//     // Use the connection
//     connection.query('SELECT something FROM sometable', function (error, results, fields) {
//       // When done with the connection, release it.
//       connection.release();
   
//       // Handle error after the release.
//       if (error) throw error;
   
//       // Don't use the connection here, it has been returned to the pool.
//     });
// });


// db.connect( error=> {
//     if(error)console.log(error);
//     else console.log("mysql connected");
//     setInterval( _ => {
//         db.query('SELECT 1', error => {
//             if( error ) console.log(error);
//         })
//     }, 60*60);
// });

module.exports = db;