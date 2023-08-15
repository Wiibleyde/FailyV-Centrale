//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les rôles
const sql = require('../../sql/rename/rename');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des autorisations
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('[Directeur] Mettre à jour mon nom')
        .addStringOption(option =>
            option.setName('action')
            .setDescription('Souhaitez vous changer ou reset mon nom ?')
            .addChoices(
                {
                    name: `M'attribuer un nouveau nom`,
                    value: `rename`
                },
                {
                    name: `Réinitialiser mon nom`,
                    value: `reset`
                }
            ).setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if(hasAuthorization(Rank.Director, interaction.member.roles.cache)) {
            if(interaction.options.getString(`action`) === `rename`) {
                const renameModal = new ModalBuilder().setCustomId(`renameModal`).setTitle(`Changer le pseudo`);
                const pseudo = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`pseudo`).setLabel(`Pseudo`).setStyle(TextInputStyle.Short).setPlaceholder(`${interaction.client.user.username}`).setRequired(true));
                renameModal.addComponents(pseudo);
                await interaction.showModal(renameModal);
            } else {
                await sql.clearName();
                interaction.guild.members.cache.get(interaction.client.user.id).setNickname('');
                await interaction.reply({ embeds: [emb.generate(null, null, `Mon nom à bien été réinitialisé !`, "#0DE600", process.env.LSMS_LOGO_V2, null, `Gestion ${interaction.client.user.username}`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                await wait(5000);
                await interaction.deleteReply();
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Seul le <@&${process.env.IRIS_DIRECTOR_ROLE}> est autorisé à s'en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion ${interaction.client.user.username}`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}
