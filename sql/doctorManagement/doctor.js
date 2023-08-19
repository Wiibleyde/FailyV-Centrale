//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // Création d'un docteur
    addDoctor: (name, phone, grade, discord_id, arrivalDate, channel_id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `INSERT INTO doctor SET name = ?, phone_number = ?, rank_id = ?, discord_id = ?, arrival_date = ?, channel_id = ?;`,
                values: [
                    name,
                    phone,
                    grade,
                    discord_id,
                    arrivalDate,
                    channel_id
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
    reAddDoctor: (id, name, grade, arrivalDate, phone) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "UPDATE `doctor` SET `discord_id`=?, `name`=?, `rank_id`=?, `arrival_date`=?, `departure_date`=NULL, `removed`='0' WHERE `phone_number`=?",
                timeout: 40000,
                values: [id, name, grade, arrivalDate, phone]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Recupération de l'ID de la fiche du docteur
    getDoctorChannelID: (phoneNumber) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `SELECT d.channel_id
                    FROM doctor d
                    WHERE d.phone_number = ? AND d.departure_date IS NULL;`,
                values: [phoneNumber]
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                if (result.length > 0) {
                    resolve(result[0].channel_id);
                } else {
                    resolve("-1");
                }
            });
        });
    },
    getOldDataByPhone: (phone) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor` WHERE `phone_number`=? AND `departure_date` IS NOT NULL AND `removed`='0'",
                values: [phone]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getDataByDiscordId: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor` WHERE `discord_id`=? AND `departure_date` IS NULL",
                values: [id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Récupération de l'ensemble des docteurs par grade
    getAllDoctor: () => {
        return new Promise((resolve, reject) => {
            let returnResult = {};
            mysql.sql().query({
                sql: `SELECT dr.id, dr.name, dr.role_id
                    FROM doctor_rank dr
                    ORDER BY \`position\`;`
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                result.forEach(element => {
                    returnResult[element.id] = {
                        name: element.name,
                        role_id: element.role_id,
                        workforce: []
                    }
                });
            });
            mysql.sql().query({
                sql: `SELECT d.name, d.phone_number, d.rank_id, DATE_FORMAT(d.arrival_date, '%d/%m/%x') arrival_date, d.holydays
                    FROM doctor d
                    WHERE d.departure_date IS NULL
                    ORDER BY d.arrival_date;`
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                result.forEach(element => {
                    returnResult[element.rank_id].workforce.push({
                        name: element.name,
                        phone_number: element.phone_number,
                        arrival_date: element.arrival_date,
                        holydays: element.holydays == 1
                    });
                });
                resolve(returnResult);
            });
        });
    },
    // Recupération de l'ID de la fiche du docteur
    getNbDoctor: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `SELECT count(*) nb_doctor
                    FROM doctor d
                    WHERE d.departure_date IS NULL;`
            }, async (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result[0].nb_doctor);
            });
        });
    },
    updateHolydaysByDiscordId: (id, holydays) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "UPDATE `doctor` SET `holydays`=? WHERE `discord_id`=? AND `departure_date` IS NULL",
                values: [holydays, id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    updateRank: (id, newRank) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "UPDATE `doctor` SET `rank_id`=? WHERE `discord_id`=? AND `departure_date` IS NULL",
                values: [newRank, id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    removeDoctor: (id, departureDate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "UPDATE `doctor` SET `departure_date`=? WHERE `discord_id`=? AND `departure_date` IS NULL",
                values: [departureDate, id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    getDoctorsToRemove: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor` WHERE `departure_date` IS NOT NULL AND `removed`='0'",
                timeout: 40000
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    setDeleted: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "UPDATE `doctor` SET `removed`='1' WHERE `id`=?",
                timeout: 40000,
                values: [id]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}
