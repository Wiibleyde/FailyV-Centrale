//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    getCommandCount: (command) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `command_statistic` WHERE `command_name`=?",
                    timeout: 40000,
                    values: [command]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getUserCount: (id, command) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `" + command + "` FROM `user_statistic` WHERE `user_id`=?",
                    timeout: 40000,
                    values: [id]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    createUserCount: (id, name, command) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `user_statistic` SET `user_id`=?, `name`=?, `" + command + "`='1'",
                    timeout: 40000,
                    values: [id, name]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    addCommandCount: (command, newCommandValue) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `command_statistic` SET `used`=? WHERE `command_name`=?",
                    timeout: 40000,
                    values: [newCommandValue, command]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    addUserCount: (id, command, newCommandValue) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `user_statistic` SET `" + command + "`=? WHERE `user_id`=?",
                    timeout: 40000,
                    values: [newCommandValue, id]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}