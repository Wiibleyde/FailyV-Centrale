//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des requêtes SQL
const sqlFollow = require('../../sql/suivi/suivi');
const sqlPPA = require('../../sql/suivi/ppa');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const format = require('../../modules/formatName');

const suivi = require('../../modules/suiviMessages');

const security = require('../../modules/service');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`ppa`)
        .setDescription(`Ajouter une personne à la liste d'attente des rendez-vous psy pour PPA`)
        .addStringOption(option =>
            option.setName(`patient`)
            .setDescription(`Prénom + Nom du patient qui souhaite passer son PPA`)
            .setRequired(true)
        ).addStringOption(option =>
            option.setName(`téléphone`)
            .setDescription(`Numéro de téléphone du patient`)
            .setMinLength(4)
            .setMaxLength(8)
            .setRequired(true)
        ).addStringOption(option =>
            option.setName(`raison`)
            .setDescription(`Raison pour laquelle le patient souhaite son PPA`)
            .addChoices(
                {
                    name: `Souhaite rejoindre/fait parti des Forces de l'Ordre`,
                    value: `0`
                },
                {
                    name: `Souhaite rejoindre/fait parti d'un service médical`,
                    value: `1`
                },
                {
                    name: `Souhaite rejoindre/fait parti de la M$T`,
                    value: `2`
                },
                {
                    name: `Souhaite passer son permis chasse`,
                    value: `3`
                },
                {
                    name: `Autre`,
                    value: `4`
                }
            ).setRequired(true)
        ).addStringOption(option =>
            option.setName(`type`)
            .setDescription(`Le type de PPA que le patient doit passer`)
            .addChoices(
                {
                    name: `PPA`,
                    value: `0`
                },
                {
                    name: `PPA2`,
                    value: `1`
                }
            )
            .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const chan = await sqlFollow.getFollowChannelId();
        if(chan[0] == null) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `❗ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez faire un </report:1140480157367402507>, merci !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }
        

        if(security.isGen()) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        const name = format.name(interaction.options.getString(`patient`));
        const dbPatient = await sqlPPA.getByName(name);

        if(dbPatient[0] != null) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Désolé il semblerai que **${name}** soit déjà dans la liste d'attente, si vous souhaitez le changer de catégorie veuillez le retirer puis l'inscrire à nouveau !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }
        
        const phone = interaction.options.getString(`téléphone`)
        //Regex des numéros de téléphone
        const regExpFull = new RegExp("^555-[0-9]{4}$");
        const regExpMidFull = new RegExp("^555[0-9]{4}$");
        const regExp = new RegExp("^[0-9]{4}$");

        // Check si le numéro de téléphone est bien sous le bon format
        if (!regExpFull.test(phone) && !regExpMidFull.test(phone) && !regExp.test(phone)) {
            try {
                await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait que le numéro de téléphone que vous avez entré n'est pas valide, vérifiez bien qu'il est au format **555-XXXX**, **555XXXX** ou **XXXX** !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            } catch (e) {
                logger.error(e);
            }
            return;
        }
        let phoneNumber = "";
        if (regExpFull.test(phone)) {
            phoneNumber = phone;
        } else if (regExpMidFull.test(phone)) {
            phoneNumber = phone.substring(3);
            phoneNumber = `555-${phoneNumber}`;
        } else if (regExp.test(phone)) {
            phoneNumber = `555-${phone}`;
        }

        if(interaction.options.getString(`type`) == null || interaction.options.getString(`type`) == '0') {
            await sqlPPA.add(name, phoneNumber, interaction.options.getString(`raison`));
        } else {
            await sqlPPA.addPPA2(name, phoneNumber, interaction.options.getString(`raison`));
        }

        await suivi.regen(interaction.client);

        await interaction.followUp({ embeds: [emb.generate(null, null, `**${name}** à bien été ajouté à la liste d'attente de suivi PPA !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();

    }
}