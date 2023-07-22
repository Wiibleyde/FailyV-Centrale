//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    clearName: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `nickname` WHERE 1",
                    timeout: 40000
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    setName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `nickname` SET `name`=?",
                    timeout: 40000,
                    values: [name]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getName: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `name` FROM `nickname` WHERE 1",
                    timeout: 40000
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}