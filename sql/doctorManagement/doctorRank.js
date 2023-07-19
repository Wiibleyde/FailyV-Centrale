//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    // Récupération des grades
    getDoctorRank: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                sql: `SELECT *
                    FROM DOCTOR_RANK;`
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                let returnResult = {}
                result.forEach(element => {
                    returnResult[element.id] = {
                        name: element.name,
                        parent_channel_id: element.parent_channel_id,
                        role_id: element.role_id
                    };
                });
                resolve(returnResult);
            });
        });
    }
}