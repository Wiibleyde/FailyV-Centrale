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

const format = require('../../modules/formatName');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`greffe`)
        .setDescription(`Ajouter un patient sur la liste d'attente de greffes`)
        .addStringOption(option =>
            option.setName(`patient`)
            .setDescription(`Prénom + Nom du patient à ajouter`)
            .setRequired(true)
        ).addStringOption(option =>
            option.setName(`organe`)
            .setDescription(`Organe pour lequel le patient est en attente de greffe`)
            .addChoices(
                {
                    name: `Poumon Gauche`,
                    value: `poumong`
                },
                {
                    name: `Poumon Droit`,
                    value: `poumond`
                },
                {
                    name: `Poumons Gauche et Droit`,
                    value: `poumongd`
                },
                {
                    name: `Rein Gauche`,
                    value: `reing`
                },
                {
                    name: `Rein Droit`,
                    value: `reind`
                },
                {
                    name: `Rein Gauche et Droit`,
                    value: `reingd`
                },
                {
                    name: `Foie`,
                    value: `foie`
                }
            ).setRequired(true)
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

        const name = format.name(interaction.options.getString(`patient`));
        let organ;
        let side = 0;
        switch(interaction.options.getString(`organe`)){
            case 'poumong':
                organ = 'Poumon';
                side = 1;
                break;
            case 'poumond':
                organ = 'Poumon';
                side = 2;
                break;
            case 'poumongd':
                organ = 'Poumons';
                side = 3;
                break;
            case 'reing':
                organ = 'Rein';
                side = 1;
                break;
            case 'reind':
                organ = 'Rein';
                side = 2;
                break;
            case 'reingd':
                organ = 'Reins';
                side = 3;
                break;
            case 'foie':
                organ = 'Foie';
                break;
            default:
                organ = '?';
                break;
        }

        await sqlFollowOrgan.addPatient(name, organ, side);
        
        security.setGen(true);
        await suivi.regen(interaction.client);
        security.setGen(false);

        await interaction.followUp({ embeds: [emb.generate(null, null, `Le/la patient(e) **${name}** a bien été(e) ajouté(e) en attente de greffe !`, "#0DE600", process.env.LSMS_LOGO_V2, null, `Gestion des greffes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true })
        await wait(5000);
        await interaction.deleteReply();

    }
}
