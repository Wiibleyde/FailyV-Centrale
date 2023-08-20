//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    getAllLungs: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_organ` WHERE `type`='poumon' ORDER BY `expire_date` ASC",
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
    getAllKidney: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_organ` WHERE `type`='rein' ORDER BY `expire_date` ASC",
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
    getAllLiver: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_organ` WHERE `type`='foie' ORDER BY `expire_date` ASC",
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
    getAllOrgans: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_organ`",
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
    getPatients: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_patient_organ`",
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
    getByOrganId: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_organ` WHERE id=?",
                    timeout: 40000,
                    values: [id]
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
    getPatientById: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_patient_organ` WHERE id=?",
                    timeout: 40000,
                    values: [id]
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
    addOrgan: (type, side, date, state) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `follow_organ` SET type=?, side=?, expire_date=?, state=?",
                    timeout: 40000,
                    values: [type, side, date, state]
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
    addPatient: (name, organ, side) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `follow_patient_organ` SET name=?, organ=?, side=?",
                    timeout: 40000,
                    values: [name, organ, side]
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
    updateOrganState: (id, state) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `follow_organ` SET state=? WHERE id=?",
                    timeout: 40000,
                    values: [state, id]
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
    deleteOrgan: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `follow_organ` WHERE id=?",
                    timeout: 40000,
                    values: [id]
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
    deletePatient: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `follow_patient_organ` WHERE id=?",
                    timeout: 40000,
                    values: [id]
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