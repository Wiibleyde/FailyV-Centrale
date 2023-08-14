//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/agenda/agenda');

module.exports = {
    execute: async function(interaction, errEmb) {
        const message = interaction.message;
        const mairieChannelID = await sql.getMairieDécèsChannelId();
        const LSPDChannelID = await sql.getLSPDChannelId();
        const datas = await sql.getByName(interaction.message.embeds[0].fields[0].value);
        interaction.guild.channels.cache.get(mairieChannelID[0].id).messages.fetch(datas[0].mayorID).then(m => m.delete());
        interaction.guild.channels.cache.get(LSPDChannelID[0].id).messages.fetch(datas[0].LSPDID).then(m => m.delete());
        message.delete();
        await sql.removeByName(interaction.message.embeds[0].fields[0].value);
    }
}
