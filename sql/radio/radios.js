//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Fonction de récupération d'une radio en DB
    getRadio: (radToGet) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `radiofreq` FROM `radio` WHERE `radioid`=?",
                    timeout: 40000,
                    values: [radToGet]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction de récupération du status d'une radio en DB
    isRadioDisplayed: (radToGet) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT `displayed` FROM `radio` WHERE `radioid`=?",
                    timeout: 40000,
                    values: [radToGet]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction d'update d'une radio en DB
    setRadio: (radToSet, radio) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `radio` SET `radiofreq`=? WHERE `radioid`=?",
                    timeout: 40000,
                    values: [radio, radToSet]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction d'update de l'affichage d'une radio en DB
    updatedRadioDisplay: (radToUp, radio) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `radio` SET `displayed`=? WHERE `radioid`=?",
                    timeout: 40000,
                    values: [radio, radToUp]
                }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}