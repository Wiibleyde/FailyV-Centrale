//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // AJout d'une inspection
    addInspection: (doctor, company, date) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `INSERT INTO inspection SET doctor = ?, company = ?, date = ?;`,
                values: [
                    doctor,
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
    updateInspection: (doctor, company, date) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `UPDATE inspection SET doctor = ?, date = ? WHERE company = ?;`,
                values: [
                    doctor,
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
    }
};
