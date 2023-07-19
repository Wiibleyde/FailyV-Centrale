//Récup du logger
const logger = require('../modules/logger');
//Récup de la connection SQL
const mysql = require('../modules/sql');

module.exports = {
    // Récupération de la fiche d'interne
    getDoctorCard: () => {
        return new Promise((resolve, reject) => {
            let returnResult = {};
            mysql.sql().query({
                sql: `SELECT *
                    FROM DOCTOR_CARD_CATEGORY dcc
                    ORDER BY dcc.\`position\`;`
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                result.forEach(element => {
                    returnResult[element.id] = {
                        name: element.name,
                        position: element.position,
                        color: element.color,
                        elements: []
                    }
                });
            });
            mysql.sql().query({
                sql: `SELECT dcc.id category_id, dc.item
                    FROM DOCTOR_CARD dc
                     INNER JOIN DOCTOR_CARD_CATEGORY dcc
                      ON dc.category = dcc.id
                    ORDER BY dcc.\`position\`, dc.position_in_category;`
            }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                result.forEach(element => {
                    returnResult[element.category_id].elements.push(element.item);
                });
                resolve(returnResult);
            });
        });
    }
}
