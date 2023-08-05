//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

const states = {
    0: "Pas envoyé",
    1: "Envoyé"
}

const types = {
    0: "Fix",
    1: "Update",
    2: "New",
    3: "Delete"
}

module.exports = {
    addFeature: (type, name, feature) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `INSERT INTO feature SET type = ?, name = ?, feature = ?, state = 0;`,
                values: [
                    type,
                    name,
                    feature
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
    updateState: (id, state) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `UPDATE feature SET state = ? WHERE id = ?;`,
                values: [
                    state,
                    id
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
    getFeature: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM feature WHERE id = ?;`,
                values: [
                    id
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                if (result.length > 0) {
                    resolve(result[0]);
                } else {
                    resolve(null);
                }
            });
        });
    },
    getFeatures: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM feature;`,
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
}
        