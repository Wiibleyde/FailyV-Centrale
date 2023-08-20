//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Ajout d'une entreprise
    addCompany: (name,acronym,side) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `company` SET `name`=?, `acronym`=?, `side`=?",
                    timeout: 40000,
                    values: [name,acronym,side]
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
    //Récupération de toutes les entreprises
    getAllcompany: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `company`",
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
    //Récupération d'une entreprise
    getCompany: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `company` WHERE `id`=?",
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
    //Modification d'une entreprise
    updateCompany: (id,name,acronym,side) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `company` SET `name`=?, `acronym`=?, `side`=? WHERE `id`=?",
                    timeout: 40000,
                    values: [name,acronym,side,id]
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
    //Suppression d'une entreprise
    deleteCompany: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `company` WHERE `id`=?",
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
    testIfExist: (name,acronym) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM company WHERE name = ? AND acronym = ?;`,
                values: [
                    name,
                    acronym
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                if (result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    },
};
