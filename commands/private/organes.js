//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des requêtes SQL
const security = require('../../modules/service');
const sqlFollow = require('../../sql/suivi/suivi');
const sqlFollowOrgan = require('../../sql/suivi/organes');
const suivi = require('../../modules/suiviMessages');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`organes`)
        .setDescription(`Ajouter un organe à la liste de suivi`)
        .addStringOption(option =>
            option.setName(`type`)
            .setDescription(`Le type d'organe à ajouter`)
            .addChoices(
                {
                    name: `Poumon`,
                    value: `Poumon`
                },
                {
                    name: `Rein`,
                    value: `Rein`
                },
                {
                    name: `Foie`,
                    value: `Foie`
                }
            ).setRequired(true)
        ).addStringOption(option =>
            option.setName(`côté`)
            .setDescription(`Le côté de l'organe à ajouter (ne pas utiliser pour le foie)`)
            .addChoices(
                {
                    name: `Gauche`,
                    value: `0`
                },
                {
                    name: `Droite`,
                    value: `1`
                },
                {
                    name: `Les deux`,
                    value: `2`
                }
            ).setRequired(false)
        ).addStringOption(option =>
            option.setName(`état`)
            .setDescription(`L'état de l'organe à ajouter`)
            .addChoices(
                {
                    name: `Sain`,
                    value: `0`
                },
                {
                    name: `Non sain`,
                    value: `1`
                }
            ).setRequired(false)
        ).addStringOption(option =>
            option.setName(`quantité`)
            .setDescription(`La quantité d'organes que vous souhaitez ajouter`)
            .setRequired(false)
        ).addStringOption(option =>
            option.setName(`date`)
            .setDescription(`Définir une date de péremption pour l'organe (format: JJ/MM/AAAA) (Laisser vide la date du jour)`)
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(false)
        ),
    async execute(interaction) {

        const chan = await sqlFollow.getFollowChannelId();
        if(chan[0] == null) {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `❗ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez faire un </report:1140480157367402507>, merci !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(security.isGen()) {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        await interaction.deferReply({ ephemeral: true });
        const type = interaction.options.getString(`type`).toLowerCase();
        let quantity;
        let side = 0;
        let state = 0;

        if(interaction.options.getString(`quantité`) != null) {
            try {
                quantity = parseInt(interaction.options.getString(`quantité`));
            } catch (err) {
                await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Ce n'est pas un nombre que tu as spécifié comme quantité ça hein <:eyes_sus:1131588112749961266>`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });            // Supprime la réponse après 5s
                await wait(5000);
                return await interaction.deleteReply();
            }
        } else {
            quantity = 1;
        }

        if(quantity == 0) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Cela risque d'être un petit peut compliqué d'ajouter du vide tu ne pense pas ?`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(type == `poumon` || type == `rein`) {
            if(interaction.options.getString(`côté`) == null) {
                await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait que vous ayez oublié de spécifier de quel côté du ${interaction.options.getString(`type`)} il s'agissait !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });            // Supprime la réponse après 5s
                await wait(5000);
                return await interaction.deleteReply();
            } else {
                side = interaction.options.getString(`côté`);
            }
        } else {
            if(interaction.options.getString(`côté`) == null) {
                side = 0;
            } else {
                await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `L'organe ${interaction.options.getString(`type`)} n'a pas de côtés spécifiques, cela ne sert à rien de le spécifier !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });            // Supprime la réponse après 5s
                await wait(5000);
                return await interaction.deleteReply();
            }
        }

        if(interaction.options.getString(`état`) != null) {
            state = interaction.options.getString(`état`);
        }

        const nowDate = new Date();
        let date;
        if(interaction.options.getString(`date`) != null) {
            const regexDate = /^(0[1-9]|1\d|2[0-9]|30(?!\/02)|31(?=\/0[13578]|\/1[02]))\/(0[1-9]|1[0-2])$/gm;
            if(!regexDate.test(interaction.options.getString(`date`))) {
                return interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait que vous n'ayez pas entré une date au format valide\nFaites bien attention à ce que le format de la date soit **JJ/MM** !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            }
            date = interaction.options.getString(`date`).split('/');
            date = nowDate.getFullYear() + '-' + date[1] + '-' + date[0] + ' 00:00:00';
        } else {
            let day = nowDate.getDate();
            day = day + 10;
            let month = nowDate.getMonth() + 1;
            let year = nowDate.getFullYear();
            if(month == 12) {
                if(day > 31) {
                    day = day - 31;
                    month = 1;
                    year ++;
                }
            } else if(month == 2) {
                if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
                    if(day > 29) {
                        day = day - 29;
                        month ++;
                    }
                } else {
                    if(day > 28) {
                        day = day - 28;
                        month ++;
                    }
                }
            } else if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10) {
                if(day > 31) {
                    day = day - 31;
                    month ++;
                }
            } else {
                if(day > 30) {
                    day = day - 30;
                    month ++;
                }}
            if (day < 10) day = '0' + day;
            if (month < 10) month = '0' + month;
            date = year + '-' + month + '-' + day + ' 00:00:00';
        }

        let day = nowDate.getDate();
        let month = nowDate.getMonth() + 1;
        let year = nowDate.getFullYear();
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;
        const dateNow = new Date(year + '-' + month + '-' + day + ' 00:00:00');
        const dateToTest = new Date(date);

        if(dateToTest<dateNow) {
            state = 1;
        }

        for(i=0;i<quantity;i++) {
            if(side == 2) {
                for(j=0;j<2;j++) {
                    try {
                        await sqlFollowOrgan.addOrgan(interaction.options.getString(`type`), j, date, state);
                    } catch (err) {
                        if(err.code == 'ER_TRUNCATED_WRONG_VALUE') {
                            return interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait que vous n'ayez pas entré une date valide, vérifiez bien qu'elle existe puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                        }
                    }
                }
            } else {
                try {
                    await sqlFollowOrgan.addOrgan(interaction.options.getString(`type`), side, date, state);
                } catch (err) {
                    if(err.code == 'ER_TRUNCATED_WRONG_VALUE') {
                        return interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait que vous n'ayez pas entré une date valide, vérifiez bien qu'elle existe puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    }
                }
            }
        }
        security.setGen(true);
        await suivi.regen(interaction.client);
        security.setGen(false);

        await interaction.followUp({ embeds: [emb.generate(null, null, `Le(s) **${type}(s)** a/ont bien été ajouté(s) à la liste de suivi !`, "#0DE600", process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true })
        await wait(5000);
        await interaction.deleteReply();

    }
}
