module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.customId == 'managementDebug') {
            const debug = require('../../modules/debug');
            debug.execute(interaction);
        } else if(interaction.customId == 'managementWorkforce') {
            const workforce = require('../../modules/regenerateWorkforce');
            workforce.execute(interaction);
        } else if(interaction.customId == 'managementBlackout') {
            const blackout = require('../../modules/blackout');
            blackout.execute(interaction);
        }
    }
}