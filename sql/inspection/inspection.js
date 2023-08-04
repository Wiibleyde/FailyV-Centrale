//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // AJout d'une inspection
    addInspection: (doctors, company, date) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `INSERT INTO inspection SET doctors = ?, company = ?, date = ?;`,
                values: [
                    doctors,
                    company,
                    date
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Update d'une inspection
    updateInspection: (doctors, company, date) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `UPDATE inspection SET doctors = ?, date = ? WHERE company = ?;`,
                values: [
                    doctors,
                    date,
                    company
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Voir l'inspection d'une entreprise
    getInspection: (company) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM inspection WHERE company = ?;`,
                values: [
                    company
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                if (result.length > 0) {
                    resolve(result[0]);
                } else {
                    resolve("-1");
                }
            });
        });
    },
    // Voir si l'inspection d'une entrprise existe réélement
    testInspection: (company) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM inspection WHERE company = ?;`,
                values: [
                    company
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                logger.debug(result)
                if (result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        })
    },
    // Voir toutes les inspections
    getInspections: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM inspection;`,
                values: []
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Supprimer une inspection
    deleteInspection: (company) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `DELETE FROM inspection WHERE company = ?;`,
                values: [
                    company
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
};
