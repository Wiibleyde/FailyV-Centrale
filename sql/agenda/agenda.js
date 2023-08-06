//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    getAgendaChannelId: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `id` FROM `channels` WHERE `name`='agenda'",
                    timeout: 40000
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getMairieDécèsChannelId: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `id` FROM `channels` WHERE `name`='mairie_décès'",
                    timeout: 40000
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getLSPDChannelId: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `id` FROM `channels` WHERE `name`='lspd'",
                    timeout: 40000
                }, async (reqErr, result, fields) => {
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
                    sql: "SELECT * FROM `agenda` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getByURL: (url) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `agenda` WHERE `eventURL`=?",
                    timeout: 40000,
                    values: [url]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getAllWaiting: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `agenda` WHERE `state`='0'",
                    timeout: 40000
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    insert: (name, date, by, responsibles, allowed, confidentiality, donor, management, cause, writter, agendaID, mayorID, LSPDID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `agenda` SET `name`=?, `date`=?, `by`=?, `responsibles`=?, `allowed`=?, `confidentiality`=?, `donor`=?, `management`=?, `cause`=?, `writter`=?, `agendaID`=?, `mayorID`=?, `LSPDID`=?",
                    timeout: 40000,
                    values: [name, date, by, responsibles, allowed, confidentiality, donor, management, cause, writter, agendaID, mayorID, LSPDID]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    insertWithDetails: (name, date, by, responsibles, allowed, confidentiality, donor, management, cause, other, writter, agendaID, mayorID, LSPDID) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `agenda` SET `name`=?, `date`=?, `by`=?, `responsibles`=?, `allowed`=?, `confidentiality`=?, `donor`=?, `management`=?, `cause`=?, `other`=?, `writter`=?, `agendaID`=?, `mayorID`=?, `LSPDID`=?",
                    timeout: 40000,
                    values: [name, date, by, responsibles, allowed, confidentiality, donor, management, cause, other, writter, agendaID, mayorID, LSPDID]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateMessageId: (oldId, newId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `agenda` SET `agendaID`=? WHERE `agendaID`=?",
                    timeout: 40000,
                    values: [newId, oldId]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateContact: (name, contact) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `agenda` SET `contact`=? WHERE `name`=?",
                    timeout: 40000,
                    values: [contact, name]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateToEventState: (name, url) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `agenda` SET `eventURL`=?, `state`='1' WHERE `name`=?",
                    timeout: 40000,
                    values: [url, name]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateToEndState: (url) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `agenda` SET `state`='2' WHERE `eventURL`=?",
                    timeout: 40000,
                    values: [url]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    removeByName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `agenda` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
}