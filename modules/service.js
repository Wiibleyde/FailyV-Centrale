//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

module.exports = {
    start: (client) => {
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        //Récupération du channel de service
        const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_CHANNEL_ID);
        //Boucle infinie pour auto-recréation en cas de supression
        setInterval(async () => {
            //Récupérations de tous les messages du channel
            const messages = await chan.messages.fetch();
            //Check si le message de service est bien présent
            const found = await getMessages(messages, client);
            //Si pas présent recréation du message
            if(!found) {
                //Embed
                const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre le dispatch - Appuyez sur 🔵 \n\nPour indiquer un off radio - Appuyez sur ⚫**\n\n\u200b`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Gestion du service`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);
                //Radios
                serviceEmb.addFields([
                    {
                        name: `💉 Radio LSMS`,
                        value: `0.0`,
                        inline: true
                    },
                    {
                        name: `👮 Radio FDO`,
                        value: `0.0`,
                        inline: true
                    }/*,
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    },
                    {
                        name: `<:bcms:1128889752284844124> Radio BCMS`,
                        value: `0.0`,
                        inline: true
                    },
                    {
                        name: `🏆 Radio Event`,
                        value: `0.0`,
                        inline: true
                    },
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    }*/
                ]);
                //Boutons de regen radios
                const radioBtns = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Régénérer la radio LSMS').setCustomId('serviceRegenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1124910934922625104'),
                    new ButtonBuilder().setLabel('Régénérer la radio BCMS').setCustomId('serviceRegenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106'),
                    new ButtonBuilder().setLabel('Régénérer la radio Event').setCustomId('serviceRegenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257')
                );
                //Boutons de gestion du service
                const btns = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Service').setCustomId('serviceSwitch').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setLabel('Dispatch').setCustomId('serviceDispatch').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setLabel('Off Radio').setCustomId('serviceSwitchOff').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('serviceKick').setStyle(ButtonStyle.Secondary).setEmoji('1128896218672681090')
                );
                //Envois
                await chan.send({ embeds: [serviceEmb], components: [radioBtns, btns] });
            }
        }, 1000);
    }
}

//Fonction séparée pour attendre la fin du check des messages un par un
function getMessages(messages, client) {
    return new Promise((resolve, reject) => {
        messages.forEach(msg => {
            if(msg.author.username == client.user.username && msg.embeds != null) {
                if(msg.embeds[0].author.name == 'Gestion du service') {
                    resolve(true);
                    return;
                }
            }
        });
        resolve(false);
    });
}