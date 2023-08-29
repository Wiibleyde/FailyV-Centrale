//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // Création d'un docteur
    addDoctor: (name, phone, grade, discord_id, arrivalDate) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `INSERT INTO doctor SET name = ?, phone_number = ?, rank_id = ?, discord_id = ?, arrival_date = ?, channel_id = '0';`,
                values: [
                    name,
                    phone,
                    grade,
                    discord_id,
                    arrivalDate
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
    addDoctorChannel: (phone, channel) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "UPDATE `doctor` SET `channel_id`=? WHERE `phone_number`=?",
                values: [
                    channel,
                    phone
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
                    return;
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
                    return;
                }
                if (result.length > 0) {
                    resolve(result[0].channel_id);
                } else {
                    resolve("-1");
                }
            });
        });
    },
    // Recupération de l'ID de la fiche du docteur
    getDoctorChannelIDByChannel: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT `channel_id` FROM `doctor` WHERE `channel_id`=?",
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
    getOldDataByPhone: (phone) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor` WHERE `phone_number`=? AND `departure_date` IS NOT NULL AND `removed`='0'",
                values: [phone]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                    return;
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
                    return;
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
                    return;
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
                    return;
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
    getAllDoctorInRank: (rank) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor` WHERE `rank_id`=?",
                timeout: 40000,
                values: [rank]
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
    getAllDoctorRemoved: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: "SELECT * FROM `doctor` WHERE `departure_date` IS NOT NULL",
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
                    return;
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
                    return;
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
                    return;
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
                    return;
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
                    return;
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
                    return;
                }
                resolve(result);
            });
        });
    }
}
