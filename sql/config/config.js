//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    updateChannel: (name, value) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `channels` SET `id` = ? WHERE `name`=?",
                    timeout: 40000,
                    values: [value, name]
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
    setChannel: (name, value) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `channels` (`name`, `id`) VALUES (?, ?)",
                    timeout: 40000,
                    values: [name, value]
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
    getChannel: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `channels` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
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
    checkIfExist: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `id` FROM `channels` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                if(result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    },
    deleteMessage: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `message` WHERE `correspond`=?",
                    timeout: 40000,
                    values: [name]
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
    setMessage: (name, value) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `message` (`correspond`, `id`) VALUES (?, ?)",
                    timeout: 40000,
                    values: [name, value]
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
    getMessage: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `message` WHERE `correspond`=?",
                    timeout: 40000,
                    values: [name]
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
    deleteCategory: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `category` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
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
    setCategory: (name, value) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `category` (`name`, `id`) VALUES (?, ?)",
                    timeout: 40000,
                    values: [name, value]
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
    getCategory: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `category` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
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
    getBlackoutMode: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `blackout` WHERE 1",
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
    setBlackoutMode: (state) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `blackout` SET `state`=? WHERE 1",
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
    }
}