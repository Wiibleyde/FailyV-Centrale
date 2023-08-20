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
                sql: `INSERT INTO features SET type = ?, name = ?, feature = ?, state = 0;`,
                values: [
                    type,
                    name,
                    feature
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
                sql: `UPDATE features SET state = ? WHERE id = ?;`,
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
    updateFeature: (id, type, name, feature) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `UPDATE features SET type = ?, name = ?, feature = ? WHERE id = ?;`,
                values: [
                    type,
                    name,
                    feature,
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
    getFeature: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM features WHERE id = ?;`,
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
                    resolve(null);
                }
            });
        });
    },
    getFeatureByName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM features WHERE name = ? AND state = 0;`,
                values: [
                    name
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
                    resolve(null);
                }
            });
        });
    },
    getFeatures: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM features;`,
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
    getFeaturesNotSent: () => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM features WHERE state = 0;`,
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
    testTitle: (title) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `SELECT * FROM features WHERE name = ? AND state = 0;`,
                values: [
                    title
                ]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
                }
                if (result.length > 0) {
                    // Il y a déjà un titre avec ce nom
                    resolve(true);
                } else {
                    // Il n'y a pas de titre avec ce nom
                    resolve(false);
                }
            });
        });
    },
    deleteFeature: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql(). query({
                sql: `DELETE FROM features WHERE id = ?;`,
                values: [
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
    }
}
        