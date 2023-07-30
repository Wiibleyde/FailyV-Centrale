//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    setChannel: (name, value) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "UPDATE `channels` SET `id` = ? WHERE `name` = ?",
                    timeout: 40000,
                    values: [value, name]
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