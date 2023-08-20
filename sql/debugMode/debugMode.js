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
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
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
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
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
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
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
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    },
    clearDebugRole: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `debug` WHERE 1",
                    timeout: 40000
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    }
}