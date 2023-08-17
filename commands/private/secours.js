//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des requêtes SQL
const sqlFollow = require('../../sql/suivi/suivi');
const sqlSecours = require('../../sql/suivi/secours');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const format = require('../../modules/formatName');

const suivi = require('../../modules/suiviMessages');

const security = require('../../modules/service');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('secours')
        .setDescription('Ajouter une personne au suivi des formations Premiers Secours')
        .addStringOption(option =>
            option.setName('personne')
            .setDescription('Prénom + Nom de la personne à ajouter au suivi')
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('téléphone')
            .setDescription('Numéro de téléphone de la personne à ajouter')
            .setMinLength(4)
            .setMaxLength(8)
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('métier')
            .setDescription('Le métier de la personne à ajouter au suivi')
            .addChoices(
                {
                    name: `Blaine County Medical Service`,
                    value: `BCMS`
                },
                {
                    name: `Civil`,
                    value: `Civil`
                },
                {
                    name: `Federal Bureau of Investigation`,
                    value: `FBI`
                },
                {
                    name: `Gouvernement de San Andreas`,
                    value: `Gouv`
                },
                {
                    name: `Los Santos County Sheriff`,
                    value: `LSCS`
                },
                {
                    name: `Los Santos Medical Service`,
                    value: `LSMS`
                },
                {
                    name: `Los Santos Police Department`,
                    value: `LSPD`
                },
                {
                    name: `Mairie de Blaine County`,
                    value: `Mairie BC`
                },
                {
                    name: `Mairie de Los Santos`,
                    value: `Mairie LS`
                },
            ).setRequired(true)
        ).addStringOption(option =>
            option.setName('catégorie')
            .setDescription('La catégorie dans laquelle vous souhaitez ajouter la personne')
            .addChoices(
                {
                    name: `Formateurs`,
                    value: `0`
                },
                {
                    name: `En attente de diplôme`,
                    value: `1`
                }
            ).setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const chan = await sqlFollow.getFollowChannelId();
        if(chan[0] == null) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `❗ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez faire un </report:1140480157367402507>, merci !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }
        
        if(security.isGen()) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        const name = format.name(interaction.options.getString(`personne`));
        const dbPatient = await sqlSecours.getByName(name);

        if(dbPatient[0] != null) {
            await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Désolé il semblerai que **${name}** soit déjà dans la liste d'attente, si vous souhaitez le changer de catégorie veuillez le retirer puis l'inscrire à nouveau !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
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
                await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait que le numéro de téléphone que vous avez entré n'est pas valide, vérifiez bien qu'il est au format **555-XXXX**, **555XXXX** ou **XXXX** !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
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

        let respText = `**${name}** à bien été ajouté à `;
        if(interaction.options.getString(`catégorie`) == null || interaction.options.getString(`catégorie`) == '1') {
            await sqlSecours.add(name, phoneNumber, interaction.options.getString(`métier`));
            respText = respText + 'la liste des personnes en attente de diplôme !';
        } else {
            await sqlSecours.addForma(name, phoneNumber, interaction.options.getString(`métier`));
            respText = respText + 'la liste des formateurs !';
        }

        await suivi.regen(interaction.client);

        await interaction.followUp({ embeds: [emb.generate(null, null, respText, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
    }
}
