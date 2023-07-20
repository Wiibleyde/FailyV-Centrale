//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Fonction de récupération d'une radio en DB
    getByPlate: (plate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `vehicule` WHERE `plate`=?",
                    timeout: 40000,
                    values: [plate]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getByName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `vehicule` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getByCategory: (type) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `vehicule` WHERE `type_order`=?",
                    timeout: 40000,
                    values: [type]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    get: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `vehicule` ORDER BY type_order, name ASC",
                    timeout: 40000
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    set: (name, plate, ct, type, type_order) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `vehicule` SET `name`=?, `plate`=?, `ct`=?, `type`=?, `type_order`=?",
                    timeout: 40000,
                    values: [name, plate, ct, type, type_order]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateCT: (ct, plate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `vehicule` SET `ct`=? WHERE `plate`=?",
                    timeout: 40000,
                    values: [ct, plate]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //0 = Dispo | 1 = À repérer | 2 = Indispo
    updateState: (state, plate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `vehicule` SET `state`=? WHERE `plate`=?",
                    timeout: 40000,
                    values: [state, plate]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateMessageID: (messageID, plate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `vehicule` SET `messageID`=? WHERE `plate`=?",
                    timeout: 40000,
                    values: [messageID, plate]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    delete: (plate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `vehicule` WHERE `plate`=?",
                    timeout: 40000,
                    values: [plate]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}