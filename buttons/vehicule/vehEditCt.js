//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/objectsManagement/vehicule');

module.exports = {
    execute: async function(interaction, errEmb) {
        logger.debug(interaction);
    }
}