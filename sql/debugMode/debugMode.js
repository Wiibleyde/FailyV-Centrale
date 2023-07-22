//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    getDebugState: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `state` FROM `debug`",
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
    getDebugRole: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `roleID` FROM `debug`",
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
    setDebugRole: (roleID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `debug` SET `roleID`=?, `state`='0'",
                    timeout: 40000,
                    values: [roleID]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    setDebugState: (state) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `debug` SET `state`=?",
                    timeout: 40000,
                    values: [state]
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