//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // Récupération des grades
    getDoctorRank: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_rank`"
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                let returnResult = null;
                if(result[0] != null) { returnResult = {}; }
                result.forEach(element => {
                    returnResult[element.id] = {
                        name: element.name,
                        parent_channel_id: element.parent_channel_id,
                        role_id: element.role_id
                    };
                });
                resolve(returnResult);
            });
        });
    },
    getRawDoctorRank: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_rank`"
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    },
    getDoctorRankById: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_rank` WHERE `role_id`=?",
                timeout: 40000,
                values: [id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    },
    getDoctorRankByName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_rank` WHERE `id`=?",
                timeout: 40000,
                values: [name]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    },
    getSpeRank: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_spe`",
                timeout: 40000
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    },
    getSpeRankById: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_spe` WHERE `role_id`=?",
                timeout: 40000,
                values: [id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                resolve(result);
            });
        });
    },
    getSpeRankByName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor_spe` WHERE `id`=?",
                timeout: 40000,
                values: [name]
            }, (reqErr, result, fields) => {
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
