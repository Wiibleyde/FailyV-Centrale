//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    add: (name, phone, company) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `follow_secours` SET `name`=?, `phone`=?, `company`=?",
                    timeout: 40000,
                    values: [name, phone, company]
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
    addForma: (name, phone, company) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `follow_secours` SET `name`=?, `phone`=?, `company`=?, `cat`='0'",
                    timeout: 40000,
                    values: [name, phone, company]
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
    getAll: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours`",
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
    getById: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `id`=?",
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
    getByName: (name) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `name`=?",
                    timeout: 40000,
                    values: [name]
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
    getByCat: (cat) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `cat`=?",
                    timeout: 40000,
                    values: [cat]
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
    getByFormaRank: (formaRank) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `cat`='0' AND `forma_rank`=?",
                    timeout: 40000,
                    values: [formaRank]
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
    getAllPatientToValidate: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `cat`='1' AND `forma_rank`='0'",
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
    getPublicService: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `cat`='1' AND `company`='BCMS' OR `cat`='1' AND `company`='FBI' OR `cat`='1' AND `company`='Gouv' OR `cat`='1' AND `company`='LSCS' OR `cat`='1' AND `company`='LSMS' OR `cat`='1' AND `company`='LSPD' OR `cat`='1' AND `company`='Mairie BC' OR `cat`='1' AND `company`='Mairie LS'",
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
    getOthers: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `cat`='1' AND `company`!='BCMS' AND `company`!='FBI' AND `company`!='Gouv' AND `company`!='LSCS' AND `company`!='LSMS' AND `company`!='LSPD' AND `company`!='Mairie BC' AND `company`!='Mairie LS'",
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
    update: (id, newRank) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `follow_secours` SET `forma_rank`=? WHERE id=?",
                    timeout: 40000,
                    values: [newRank, id]
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
    getSelected: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `follow_secours` WHERE `is_selected`='1'",
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
    delete: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "DELETE FROM `follow_secours` WHERE id=?",
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
    }
}