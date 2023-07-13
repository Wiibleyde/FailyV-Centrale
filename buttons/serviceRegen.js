//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Récup des requêtes SQL
const sql = require('./../sql/radios');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.member.roles.cache.has(serviceID)) {
            //Generation aléatoire de la radio entre 250.0 et 344.9
            const freqUnit = Math.floor(Math.random() * (344-250+1)) + 250;
            const freqDeci = Math.floor(Math.random() * 10);
            const freq = freqUnit + '.' + freqDeci;
            //Recréation de l'embed pour édition du message
            const embed = emb.generate(null, null, interaction.message.embeds[0].description, interaction.message.embeds[0].color, interaction.message.embeds[0].thumbnail.url, null, interaction.message.embeds[0].author.name, interaction.message.embeds[0].thumbnail.url, null, null, null, false);
            //Récupération de la radio LSMS si non régénérée
            var freqLSMS = interaction.message.embeds[0].fields[0].value;
            var freqFDO = interaction.message.embeds[0].fields[1].value;
            //Changement de la fréquence si radio LSMS régen
            if(interaction.customId == 'serviceRegenLSMS') { freqLSMS = freq; await sql.setRadio('lsms', freqLSMS); }
            //Ajout des radios
            embed.addFields([
                {
                    name: interaction.message.embeds[0].fields[0].name,
                    value: freqLSMS,
                    inline: true
                },
                {
                    name: interaction.message.embeds[0].fields[1].name,
                    value: freqFDO,
                    inline: true
                }
            ]);
            //Création de variables de base
            var titleBCMS = '<:bcms:1128889752284844124> Radio BCMS';
            var titleEvent = '🏆 Radio Event';
            var freqBCMS = '0.0';
            var freqEvent = '0.0';
            var freqToRegen;
            //Check de si les radios optionnelles doivent être affichées
            var genBCMS = await sql.getRadio('bcmsgen');
            genBCMS = genBCMS[0].bcmsgen;
            var genEvent = await sql.getRadio('eventgen');
            genEvent = genEvent[0].eventgen;
            //Changement de la fréquence si radio BCMS régen
            if(interaction.customId == 'serviceRegenBCMS') { freqBCMS = freq; genBCMS = '1'; await sql.setRadio('bcmsgen', '1'); await sql.setRadio('bcms', freqBCMS); freqToRegen = 'bcms'; }
            //Changement de la fréquence si radio Event régen
            if(interaction.customId == 'serviceRegenEvent') { freqEvent = freq; genEvent = '1'; await sql.setRadio('eventgen', '1'); await sql.setRadio('event', freqEvent); freqToRegen = 'event'; }
            if(genBCMS == '1' && genEvent == '0') {
                //Récupération de la radio BCMS si non régénérée
                if(interaction.message.embeds[0].fields[3] != null) {
                    titleBCMS = interaction.message.embeds[0].fields[3].name;
                    if(freqToRegen != 'bcms') {
                        freqBCMS = interaction.message.embeds[0].fields[3].value;
                    }
                }
                embed.addFields([
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    },
                    {
                        name: titleBCMS,
                        value: freqBCMS,
                        inline: true
                    },
                ]);
            } else if(genBCMS == '0' && genEvent == '1') {
                //Récupération de la radio Event si non régénérée
                if(interaction.message.embeds[0].fields[3] != null) {
                    titleEvent = interaction.message.embeds[0].fields[3].name;
                    if(freqToRegen != 'event') {
                        freqEvent = interaction.message.embeds[0].fields[3].value;
                    }
                }
                embed.addFields([
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    },
                    {
                        name: titleEvent,
                        value: freqEvent,
                        inline: true
                    },
                ]);
            } else if(genBCMS == '1' && genEvent == '1') {
                //Récupération de la radio BCMS et Event si non régénérée
                if(interaction.message.embeds[0].fields[3] != null) {
                    if(interaction.message.embeds[0].fields[3].name == '<:bcms:1128889752284844124> Radio BCMS') {
                        titleBCMS = interaction.message.embeds[0].fields[3].name;
                        if(freqToRegen != 'bcms') {
                            freqBCMS = interaction.message.embeds[0].fields[3].value;
                        }
                    } else {
                        titleEvent = interaction.message.embeds[0].fields[3].name;
                        if(freqToRegen != 'event') {
                            freqEvent = interaction.message.embeds[0].fields[3].value;
                        }
                    }
                }
                if(interaction.message.embeds[0].fields[4] != null) {
                    if(interaction.message.embeds[0].fields[4].name == '<:bcms:1128889752284844124> Radio BCMS') {
                        titleBCMS = interaction.message.embeds[0].fields[4].name;
                        if(freqToRegen != 'bcms') {
                            freqBCMS = interaction.message.embeds[0].fields[4].value;
                        }
                    } else {
                        titleEvent = interaction.message.embeds[0].fields[4].name;
                        if(freqToRegen != 'event') {
                            freqEvent = interaction.message.embeds[0].fields[4].value;
                        }
                    }
                }
                embed.addFields([
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    },
                    {
                        name: titleBCMS,
                        value: freqBCMS,
                        inline: true
                    },
                    {
                        name: titleEvent,
                        value: freqEvent,
                        inline: true
                    },
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    }
                ]);
            }
            //Édition du message
            await interaction.message.edit({ embeds: [embed], components: [interaction.message.components[0], interaction.message.components[1]] });
            //Confirmation à Discord du succès de l'opération
            await interaction.deferUpdate();
        } else {
            await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, vous devez être en service pour régénérer une radio !`, `#ff0000`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
        }
    }
}