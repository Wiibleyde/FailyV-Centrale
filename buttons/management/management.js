const service = require('../../modules/service');
const emb = require('../../modules/embeds');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.customId == 'managementDebug') {
            const debug = require('../../modules/debug');
            debug.execute(interaction);
        } else if(interaction.customId == 'managementWorkforce') {
            const workforce = require('../../modules/regenerateWorkforce');
            workforce.execute(interaction);
        } else if(interaction.customId == 'managementBlackout') {
            if(service.isGen()) {
                const title = `BLACKOUT`;
                const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
                const embed = emb.generate(null, null, `Désolé, il y a déjà quelque chose en cours de régénération !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                await wait(5000);
                await interaction.deleteReply();
            }
            const blackout = require('../../modules/blackout');
            blackout.execute(interaction);
        }
    }
}