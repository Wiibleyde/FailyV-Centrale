//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // AJout d'une inspection
    addInspection: (doctorId, company, date) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `inspection` (`doctor_id`, `company`, `date`) VALUES (?, ?, ?)",
                    timeout: 40000,
                    values: [doctorId, company, date]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Récupération des inspections
    getInspections: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `inspection`",
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
    // Récupération des inspections d'une entreprise
    getInspectionsByCompany: (company) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `inspection` WHERE `company`=?",
                    timeout: 40000,
                    values: [company]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Récupération des inspections d'un docteur
    getInspectionsByDoctor: (doctorId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `inspection` WHERE `doctor_id`=?",
                    timeout: 40000,
                    values: [doctorId]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateInspection: (company,date,doctorId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `inspection` SET `company`=?, `date`=? WHERE `doctor_id`=?",
                    timeout: 40000,
                    values: [company,date,doctorId]
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
