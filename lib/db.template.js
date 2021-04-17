const mysql = require('mysql');

const db = mysql.createConnection({
    host: '',
    user: '',
    port: '',
    password: '',
    database: ''
});
db.connect();

module.exports = db;