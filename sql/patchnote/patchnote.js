//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

const states = {
    0: "Pas envoyé",
    1: "Envoyé"
}

module.exports = {
    createPatchnote: (name, version, features) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `INSERT INTO patchnote SET name = ?, version = ?, features = ?, state = 0;`,
                values: [
                    name,
                    version,
                    features
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
                sql: `UPDATE patchnote SET state = ? WHERE id = ?;`,
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
    addFeature: (id, feature) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `UPDATE patchnote SET features = ? WHERE id = ?;`,
                values: [
                    feature,
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
    getPatchnote: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM patchnote WHERE id = ?;`,
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
                    resolve("-1");
                }
            });
        });
    },
    getPatchnotes: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM patchnote;`,
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