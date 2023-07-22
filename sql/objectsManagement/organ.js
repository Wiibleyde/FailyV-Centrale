//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Fonction qui récupère la liste des organes
    get: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `organe`",
                    timeout: 40000
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction qui récupère un organe
    getById: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `organe` WHERE `id` = ?",
                    timeout: 40000,
                    values: [id]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction qui ajoute un organe
    add: (type,side,valid) => {
        return new Promise((resolve, reject) => {
            const date = new Date();
            mysql.sql().query({
                    sql: "INSERT INTO `organe` (`type`, `side`, `valid`, `date`) VALUES (?, ?, ?, ?)",
                    timeout: 40000,
                    values: [type,side,valid,date]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
};
