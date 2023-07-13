//Appel de MySQL
const mysql = require('mysql');

//Création d'une connection MySQL avec les infos dans le .env
const connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_USER_PASS,
    database: process.env.SQL_DB,
    charset: 'utf8mb4'
});

module.exports = {
    sql: () => {
        return connection;
    }
}