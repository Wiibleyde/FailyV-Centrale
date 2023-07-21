//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Fonction de récupération d'une radio en DB
    registerRDV: (type, patient, phone, note, contact, writter, messageID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `rdv` SET `type`=?, `patient`=?, `phone`=?, `note`=?, `contact`=?, `writter`=?, `messageID`=?",
                    timeout: 40000,
                    values: [type, patient, phone, note, contact, writter, messageID]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateRDVContact: (contact, color, messageID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `rdv` SET `contact`=?, `color`=? WHERE `messageID`=?",
                    timeout: 40000,
                    values: [contact, color, messageID]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateRDVTaker: (taker, color, messageID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `rdv` SET `taker`=?, `color`=? WHERE `messageID`=?",
                    timeout: 40000,
                    values: [taker, color, messageID]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateRDVMessageId: (oldMessageID, newMessageID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `rdv` SET `messageID`=? WHERE `messageID`=?",
                    timeout: 40000,
                    values: [newMessageID, oldMessageID]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    deleteRDV: (messageID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `rdv` WHERE `messageID`=?",
                    timeout: 40000,
                    values: [messageID]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction de récupération d'une radio en DB
    getRDVByType: (type) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `rdv` WHERE `type`=?",
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
    }
}
