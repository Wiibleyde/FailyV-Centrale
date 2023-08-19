const wait = require('node:timers/promises').setTimeout;
const emb = require('../../modules/embeds');

module.exports = {
    execute: async function(interaction, errEmb) {
        const member = interaction.member;
        if(member.roles.cache.has(process.env.IRIS_CFX_ROLE)) {
            await member.roles.remove(process.env.IRIS_CFX_ROLE);
            await interaction.reply({ embeds: [emb.generate(null, null, `Rôle de notification retiré !`, `#FF0000`, null, null, `Cfx.re Status`, null, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        await member.roles.add(process.env.IRIS_CFX_ROLE);
        await interaction.reply({ embeds: [emb.generate(null, null, `Rôle de notification ajouté !`, `#0DE600`, null, null, `Cfx.re Status`, null, null, null, null, false)], ephemeral: true });
        await wait(5000);
        return await interaction.deleteReply();
    }
}