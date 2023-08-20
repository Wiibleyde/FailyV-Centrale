//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

const states = {
    0: "Pas envoyé",
    1: "Envoyé"
}

module.exports = {
    createPatchnote: (name, version) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `INSERT INTO patchnote SET name = ?, version = ?, state = 0, features_id = "";`,
                values: [
                    name,
                    version,
                ]
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
                    return;
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
                    return;
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
                    return;
                }
                resolve(result);
            });
        });
    },
    getLastPatchnote: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM patchnote ORDER BY id DESC LIMIT 1;`,
                values: []
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                if (result.length > 0) {
                    resolve(result[0]);
                } else {
                    resolve("-1");
                }
            });
        });
    },
    deleteLastPatchnote: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `DELETE FROM patchnote ORDER BY id DESC LIMIT 1;`,
                values: []
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
    addFeatureToLastPatchnote: (features,patchnote_id) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `UPDATE patchnote SET features_id = ? WHERE id = ?;`,
                values: [
                    features,
                    patchnote_id
                ]
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