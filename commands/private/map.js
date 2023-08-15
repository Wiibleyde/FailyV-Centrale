// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');
// Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');

const channels = require('../../sql/config/config');
const doctor = require('../../sql/doctorManagement/doctor');
const doctorRoles = require('../../sql/doctorManagement/doctorRoles');

const rolesManager = require('../../modules/rolesManager');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('[Directeur Adjoint +] Mettre à pied une personne')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à mettre à pied')
            .setRequired(true)
        ).addStringOption(option => 
            option.setName('type')
            .setDescription('Type de mise à pied')
            .addChoices(
                {
                    name: 'Classique',
                    value: 'classique'
                },
                {
                    name: 'Conservatoire',
                    value: 'conservatoire'
                }
            )
            .setRequired(true)
        ).addStringOption(option => 
            option.setName('motif')
            .setDescription('Motif de la sanction')
            .setRequired(true)
        ).addNumberOption(option => 
            option.setName('temps')
            .setDescription('Temps en heure de la mise à pied')
            .setRequired(false)
        ).addStringOption(option => 
            option.setName('visibilité')
            .setDescription('Visibilité de la mise à pied')
            .addChoices(
                {
                    name: 'Privé',
                    value: 'private'
                },
                {
                    name: 'Publique',
                    value: 'public'
                }
            )
            .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serverIcon = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`;
        const title = `Gestion des employés`;

        const user = interaction.options.getUser('membre');
        const member = interaction.guild.members.cache.get(user.id);
        const type = interaction.options.getString('type');
        const reason = interaction.options.getString('motif');
        const time = interaction.options.getNumber('temps');
        const visibility = interaction.options.getString('visibilité');
        const memberData = await doctor.getDataByDiscordId(user.id);
        const staffRepresentativeChannelId = await channels.getChannel('staff_representative');

        if(!hasAuthorization(Rank.AssistantManager, interaction.member.roles.cache)) {
            const embed = emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_ASSISTANT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(user.id == process.env.IRIS_DISCORD_ID) {
            const embed = emb.generate(`Désolé :(`, null, `Pourquoi voulez-vous me mettre à pied ??? Je n'ai rien fait de mal pourtant, je suis un·e secrétaire exemplaire voyons !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(user.id == interaction.user.id) {
            const embed = emb.generate(`Désolé :(`, null, `Je n'ai pas l'autorisation de vous laisser vous mettre à pied vous même !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(memberData[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `La personne que vous avez sélectionnée ne fait pas partie de l'effectif du LSMS, veuillez vérifier la personne que vous souhaitez mettre à pied puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const memberRoles = await doctorRoles.getRoles(user.id);

        if(memberRoles[0] != null) {
            const embed = emb.generate(`Désolé :(`, null, `La personne que vous avez sélectionnée est encore en vacances, veuillez lui remettre ses accès avec la commande </vacances:${process.env.IRIS_VACATION_COMMAND_ID}> puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(staffRepresentativeChannelId[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `Il semblerait que le salon du/des délégué(s) du personnel n'est pas défini hors il doit l'être pour effectuer une sanction !\nPour le définir veuillez utiliser la commande </define:${process.env.IRIS_DEFINE_COMMAND_ID}>`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const memberChannel = interaction.guild.channels.cache.get(memberData[0].channel_id);
        const staffRepresentativeChannel = interaction.guild.channels.cache.get(staffRepresentativeChannelId[0].id);
        
        let sanctionText;
        let publicTime = '';
        if(type == 'classique') {
            if(time == null) {
                const embed = emb.generate(`Désolé :(`, null, `Vous devez spécifier un temps en **heure** pour une mise à pied classique !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
            sanctionText = 'Mise à pied';
        } else {
            sanctionText = 'Mise à pied à titre ' + type;
        }

        await rolesManager.switchVacacionMode(user, member, interaction.guild, interaction.member);

        const privateEmbed = emb.generate(null, null, sanctionText, `Gold`, null, null, `Sanction`, serverIcon, null, interaction.member.nickname, null, true);
        if(time != null) { publicTime = `\n\n**Durée:** ${time}h`; privateEmbed.addFields({ name: '**Durée:**', value: time + 'h', inline: false }); }
        privateEmbed.addFields({ name: '**Motif:**', value: reason, inline: false });
        await memberChannel.send({ embeds: [privateEmbed] });
        privateEmbed.spliceFields(0, 2);
        privateEmbed.setThumbnail(process.env.LSMS_LOGO_V2);
        privateEmbed.addFields({ name: '**Membre:**', value: memberData[0].name, inline: false });
        if(time != null) { privateEmbed.addFields({ name: '**Durée:**', value: time + 'h', inline: false }); }
        privateEmbed.addFields({ name: '**Motif:**', value: reason, inline: false });
        await staffRepresentativeChannel.send({ embeds: [privateEmbed] });

        if(visibility != null && visibility == 'public') {
            const announceChanId = await channels.getChannel('IRIS_ANNOUNCEMENT_CHANNEL_ID');
            if(announceChanId[0] != null) {
                try {
                    const chan = await interaction.guild.channels.cache.get(announceChanId[0].id);
                    const respEmb = emb.generate(null, null, `${sanctionText} de **${memberData[0].name}**${publicTime}\n\n**Motif:** ${reason}\n\n*Merci de ne faire aucun commentaire et/ou moquerie s'il vous plaît ❤️*`, `Gold`, process.env.LSMS_LOGO_V2, null, `Annonce`, serverIcon, null, interaction.member.nickname, null, true);
                    const msg = await chan.send({ embeds: [respEmb] });
                    try {
                        await msg.react('<:yes:1139625753181433998>');
                    } catch (err2) {
                        logger.error(err2);
                        await msg.react('✅');
                    }
                } catch (err) {
                    logger.error(err);
                    const embed = emb.generate(`Attention`, null, `La mise à pied à bien été effectuée mais il semblerait que le salon d'annonce ne soit pas à jour, pour corriger se problème veuillez le redéfinir via la commande </define:${process.env.IRIS_DEFINE_COMMAND_ID}> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                    await interaction.followUp({ embeds: [embed], ephemeral: true });
                    await wait(5000);
                    return await interaction.deleteReply();
                }
            } else {
                const embed = emb.generate(`Attention`, null, `La mise à pied à bien été effectuée mais aucun salon d'annonce n'a été trouvé en base de donnée, pour corriger se problème veuillez le définir via la commande </define:${process.env.IRIS_DEFINE_COMMAND_ID}> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
        }

        const embed = emb.generate(null, null, `${user} à bien été mis(e) à pied !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();

    },
};
