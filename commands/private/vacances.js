//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Importantion du module pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Récup du gestionnaire des rôles
const rolesManager = require('../../modules/rolesManager');
const workforce = require('../../modules/workforce');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('vacances')
        .setDescription('[Spécialistes +] Mettre un docteur en vacances ou retirer les accès')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('Le docteur que vous souhaitez mettre en vacances')
            .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.RequestToSpeak),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        const serverIcon = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`;
        const title = `Gestion des employés`;
        if(!hasAuthorization(Rank.Specialist, interaction.member.roles.cache)) {
            const embed = emb.generate("Désolé :(", null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        //Récupération du docteur
        const user = interaction.options.getUser('membre');
        const member = interaction.guild.members.cache.get(user.id);

        //Si l'utilisateur est le bot ne pas continuer
        if(user.id == process.env.IRIS_DISCORD_ID) {
            const embed = emb.generate(`Désolé :(`, null, `Je ne prend pas de vacances, imaginez si vous deviez vous débrouiller sans moi !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(user.id == interaction.user.id) {
            const embed = emb.generate(`Désolé :(`, null, `Je n'ai pas l'autorisation de vous laisser vous mettre en vacances vous même !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const switchMode = await rolesManager.switchVacacionMode(user, member, interaction.guild, interaction.member);

        await workforce.generateWorkforce(interaction.guild, interaction);

        if(switchMode != 'returned' && switchMode != 'gone') {
            logger.error(switchMode);
            return;
        }

        if(switchMode == 'returned') {
            //Envoi d'un embed de confirmation
            interaction.followUp({ embeds: [emb.generate(null, null, `${user} est bien revenu de vacances !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        } else {
            //Envoi d'un embed de confirmation
            interaction.followUp({ embeds: [emb.generate(null, null, `${user} à bien été mis en vacances !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
    }
}
