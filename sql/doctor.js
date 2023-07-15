//Récup du logger
const logger = require('./../modules/logger');
//Récup de la connection SQL
const mysql = require('./../modules/sql');

module.exports = {
    // Création d'un docteur
    addDoctor: (firstName, lastName, phone, grade, discord_id, arrivalDate, channel_id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `INSERT INTO DOCTOR SET first_name = ?, last_name = ?, phone_number = ?, rank_id = ?, discord_id = ?, arrival_date = ?, channel_id = ?;`,
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
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    // Recupération de l'ID de la fiche du docteur
    getDoctorChannelID: (firstName, lastName, discord_id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `SELECT d.channel_id
                    FROM DOCTOR d
                    WHERE d.first_name = ? AND d.last_name = ? AND d.discord_id = ? AND d.departure_date IS NULL;`,
                values: [firstName, lastName, discord_id]
            }, (reqErr, result, fields) => {
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
    }
}
