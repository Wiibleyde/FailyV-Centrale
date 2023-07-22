//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // Création d'un docteur
    addDoctor: (firstName, lastName, phone, grade, discord_id, arrivalDate, channel_id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `INSERT INTO doctor SET first_name = ?, last_name = ?, phone_number = ?, rank_id = ?, discord_id = ?, arrival_date = ?, channel_id = ?;`,
                values: [
                    firstName,
                    lastName,
                    phone,
                    grade,
                    discord_id,
                    arrivalDate,
                    channel_id
                ]
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
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
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
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
    // Récupération de l'ensemble des docteurs par grade
    getAllDoctor: () => {
        return new Promise((resolve, reject) => {
            let returnResult = {};
            mysql.sql().query({
                sql: `SELECT dr.id, dr.name, dr.role_id
                    FROM doctor_rank dr
                    ORDER BY \`position\`;`
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
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
                sql: `SELECT d.first_name, d.last_name, d.phone_number, d.rank_id, DATE_FORMAT(d.arrival_date, '%d/%m/%x') arrival_date
                    FROM doctor d
                    ORDER BY d.arrival_date;`
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                result.forEach(element => {
                    returnResult[element.rank_id].workforce.push({
                        first_name: element.first_name,
                        last_name: element.last_name,
                        phone_number: element.phone_number,
                        arrival_date: element.arrival_date
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
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    await logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result[0].nb_doctor);
            });
        });
    }
}
