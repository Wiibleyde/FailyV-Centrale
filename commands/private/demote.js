// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');
// Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');

const channels = require('../../sql/config/config');
const roles = require('../../sql/doctorManagement/doctorRank');
const doctor = require('../../sql/doctorManagement/doctor');

const workforce = require('../../modules/workforce');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('demote')
        .setDescription('Rétrograder/Retirer un(e) grade/spé/formation à la personne sélectionnée')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à rétrograder')
            .setRequired(true)
        ).addRoleOption(option => 
            option.setName('rôle')
            .setDescription('Le rôle à retirer')
            .setRequired(true)
        ).addStringOption(option => 
            option.setName('motif')
            .setDescription('Motif de la rétrogradation')
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('visibilité')
            .setDescription('Visibilité de la raison de la sanction')
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
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serverIcon = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`;
        const title = `Gestion des employés`;

        if(!hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
            const embed = emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const user = interaction.options.getUser('membre');
        const role = interaction.options.getRole('rôle');
        const reason = interaction.options.getString('motif');
        const memberData = await doctor.getDataByDiscordId(user.id);

        if(user.id == process.env.IRIS_DISCORD_ID) {
            const embed = emb.generate(`Désolé :(`, null, `Je ne vois pas de grade en dessous de moi, il est donc impossible de me rétrograder`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(user.id == interaction.user.id) {
            const embed = emb.generate(`Désolé :(`, null, `Je n'ai pas l'autorisation de vous laisser vous rétrograder vous même !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(memberData[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `La personne que vous avez sélectionnée ne fait pas partie de l'effectif du LSMS, veuillez vérifier la personne que vous souhaitez rétrograder puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const allRanks = await roles.getDoctorRank();
        const allSpe = await roles.getSpeRank();

        if(allRanks == null || allSpe[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `Aucun grade et/ou spécialité n'a été trouvé dans la base de donnée, veuillez contacter un de mes développeur (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour corriger ce problème !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        let type;
        const rank = await roles.getDoctorRankById(role.id);
        const spe = await roles.getSpeRankById(role.id);
        if(rank[0] == null && spe[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `${role} n'est pas un rôle retirable, vérifiez bien le rôle que vous souhaitez retirer puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        } else { if(rank[0] != null) { type = 'rank'; } else { type = 'spe'; } }

        const member = await interaction.guild.members.cache.get(user.id);
        if(!member.roles.cache.has(role.id) && type == 'spe') {
            const embed = emb.generate(`Désolé :(`, null, `${user} n'a pas le rôle ${role}, veuillez vérifier le rôle que vous souhaitez retirer puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const memberChannel = interaction.guild.channels.cache.get(memberData[0].channel_id);
        const staffRepresentativeChannelId = await channels.getChannel('staff_representative');
        if(staffRepresentativeChannelId[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `Il semblerait que le salon du/des délégué(s) du personnel n'est pas défini hors il doit l'être pour effectuer une sanction !\nPour le définir veuillez utiliser la commande </define:>`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        const staffRepresentativeChannel = interaction.guild.channels.cache.get(staffRepresentativeChannelId[0].id);
        let emote = `<:no:1138856467848507452> `;
        let authorText;
        let text;
        let privateText;
        let demoteType;
        let contentText = null;

        if(type == 'spe') {
            authorText = 'Sanction';
            const start = `Retrait de`;
            privateText = ` la spécialitée ${role}`;
            if(spe[0].id == 'helico1') {
                const helico2Id = await roles.getSpeRankByName('helico2');
                if(member.roles.cache.has(helico2Id[0].role_id)) {
                    privateText = `s formations ${role} et <@&${helico2Id[0].role_id}>`;
                    await member.roles.remove(helico2Id[0].role_id);
                } else {
                    privateText = ` la formation ${role}`;
                }
            }
            if(spe[0].id == 'helico2' || spe[0].id == 'ppa' || spe[0].id == 'sorting') {
                privateText = ` la formation ${role}`;
            }
            await member.roles.remove(role.id);
            demoteType = start + privateText + ` à **${user}** effectué !`;
            text = emote + start + privateText + ` à **${memberData[0].name}**`;
            privateText = start + privateText;
        }

        if(type == 'rank') {
            authorText = 'Rétrogradation';
            const currentRank = await roles.getDoctorRankByName(memberData[0].rank_id);
            const currentRole = await interaction.guild.roles.cache.get(currentRank[0].role_id);
            if(rank[0].position<currentRank[0].position) {
                const embed = emb.generate(`Désolé :(`, null, `Le grade ${role} est au dessus du grade ${currentRole} ce qui signifie qu'il s'agit d'une promotion, si c'est réellement ce que vous souhaitez faire merci d'utiliser la commande dédiée à cela (</promote:>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
            if(rank[0].position == currentRank[0].position) {
                const embed = emb.generate(`Désolé :(`, null, `${user} a déjà le rôle ${role}, veuillez vérifier le nouveau grade que vous souhaitez lui attribuer puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }

            await member.roles.add(role.id);
            await member.roles.remove(currentRank[0].role_id);
            try {
                await memberChannel.setParent(rank[0].parent_channel_id);
            } catch (err) {
                logger.error(err);
                const embed = emb.generate(`Oups :(`, null, `Il semblerait que la catégorie pour les fiches de suivi des ${role} n'ait pas été définie/n'existe plus, si le problème persiste merci de bien vouloir le signaler à l'aide de la commande </report:${process.env.IRIS_DEBUG_COMMAND_ID}> !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                return await interaction.followUp({ embeds: [embed], ephemeral: true });
            }
            await doctor.updateRank(user.id, rank[0].id);
            workforce.generateWorkforce(interaction.guild);
            text = `⬇️ Rétrogradation **${memberData[0].name}** au grade de ${role}`;
            privateText = `Passage ${role}`;
            demoteType = authorText + ` de **${user}** au rôle de ${role} effectué !`;
            contentText = `<@&${process.env.IRIS_LSMS_ROLE}>`;
        }

        if(interaction.options.getString('visibilité') == null || interaction.options.getString('visibilité') == 'private') {
        } else { text = text + '\n\n**Motif:** ' + reason; }

        const privateEmbed = emb.generate(null, null, privateText, `#FF0000`, null, null, authorText, serverIcon, null, interaction.member.nickname, null, true);
        privateEmbed.addFields({ name: '**Motif:**', value: reason, inline: false });
        await memberChannel.send({ embeds: [privateEmbed] });
        privateEmbed.setThumbnail(process.env.LSMS_LOGO_V2);
        await staffRepresentativeChannel.send({ embeds: [privateEmbed] });

        const announceChanId = await channels.getChannel('IRIS_ANNOUNCEMENT_CHANNEL_ID');
        if(announceChanId[0] != null) {
            try {
                const chan = await interaction.guild.channels.cache.get(announceChanId[0].id);
                const respEmb = emb.generate(null, null, text + `\n\n*Merci de ne faire aucun commentaire et/ou moquerie s'il vous plaît ❤️*`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Annonce`, serverIcon, null, interaction.member.nickname, null, true);
                const msg = await chan.send({ content: contentText, embeds: [respEmb] });
                try {
                    await msg.react('<:yes:1139625753181433998>');
                } catch (err2) {
                    logger.error(err2);
                    await msg.react('✅');
                }
            } catch (err) {
                logger.error(err);
                const embed = emb.generate(`Attention`, null, `La rétrogradation à bien été effectuée mais il semblerait que le salon d'annonce ne soit pas à jour, pour corriger se problème veuillez le redéfinir via la commande </define:> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
        } else {
            const embed = emb.generate(`Attention`, null, `La rétrogradation à bien été effectuée mais aucun salon d'annonce n'a été trouvé en base de donnée, pour corriger se problème veuillez le définir via la commande </define:> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const embed = emb.generate(null, null, demoteType, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
    },
};
