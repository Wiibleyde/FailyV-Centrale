//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Fonction de récupération des patient
    get: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `lit`",
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
    //Fonction de récupération des lits utilisés
    getLetters: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `letter` FROM `lit` ORDER BY `letter` ASC",
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
    //Fonction de récupération du message des lits
    getMessageId: (bed) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `id` FROM `message` WHERE `correspond`=?",
                    timeout: 40000,
                    values: [bed]
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
    clearMessageId: (bed) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `message` WHERE `correspond`=?",
                    timeout: 40000,
                    values: [bed]
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
    setMessageId: (msgId, bed) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `message` SET `id`=?, `correspond`=?",
                    timeout: 40000,
                    values: [msgId, bed]
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
    //Fonction d'ajout d'un patient
    add: (patient, letter, surveillance) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `lit` (`patient`, `letter`, `surveillance`) VALUES (?, ?, ?)",
                    timeout: 40000,
                    values: [patient, letter, surveillance]
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
    //Fonction d'update d'un patient
    update: (patient, letter, surveillance) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `lit` SET `letter`=?, `surveillance`=? WHERE `patient`=?",
                    timeout: 40000,
                    values: [letter, surveillance, patient]
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
    //Fonction d'update d'un patient
    remove: (letter) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `lit` WHERE `letter`=?",
                    timeout: 40000,
                    values: [letter]
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