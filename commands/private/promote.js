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
        .setName('promote')
        .setDescription('Promouvoir/Ajouter un(e) grade/spé/formation à la personne sélectionnée')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à promouvoir')
            .setRequired(true)
        ).addRoleOption(option => 
            option.setName('rôle')
            .setDescription('Le nouveau rôle à attribuer')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serverIcon = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`;
        const title = `Gestion des employés`;

        if(!hasAuthorization(Rank.Specialist, interaction.member.roles.cache)) {
            const embed = emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_SPECIALIST_ROLE}> ou plus pour pouvoir vous en servir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const user = interaction.options.getUser('membre');
        const role = interaction.options.getRole('rôle');
        const memberData = await doctor.getDataByDiscordId(user.id);

        if(user.id == process.env.IRIS_DISCORD_ID) {
            const embed = emb.generate(`Désolé :(`, null, `Je ne suis pas docteur cela ne sert donc à rien de m'attribuer une spécialité ou de me promouvoir, mon rôle de secrétaire me conviens très bien !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(user.id == interaction.user.id) {
            const embed = emb.generate(`Désolé :(`, null, `Je n'ai pas l'autorisation de vous laisser vous promouvoir vous même !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(memberData[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `La personne que vous avez sélectionnée ne fait pas partie de l'effectif du LSMS, veuillez vérifier la personne que vous souhaitez promouvoir puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
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
            const embed = emb.generate(`Désolé :(`, null, `${role} n'est pas un rôle attribuable, vérifiez bien le rôle que vous souhaitez attribuer puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        } else { if(rank[0] != null) { type = 'rank'; } else { type = 'spe'; } }

        const member = await interaction.guild.members.cache.get(user.id);
        if(member.roles.cache.has(role.id)) {
            const embed = emb.generate(`Désolé :(`, null, `${user} à déjà le rôle ${role}, veuillez vérifier le rôle que vous souhaitez attribuer puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const memberChannel = interaction.guild.channels.cache.get(memberData[0].channel_id);
        let text;
        let startPrivateText;
        let privateText;
        let promoType;
        let contentText = null;

        if(type == 'spe') {
            let emote = ``;
            if(spe[0].emote != '') {
                emote = `${spe[0].emote} `;
            }
            const start = emote + `Félicitation à **${memberData[0].name}** qui valide `;
            text = start + `sa formation ${role} !`;
            startPrivateText = emote + `Passage `;
            privateText = startPrivateText + `la spécialitée ${role}`;
            if(spe[0].id == 'helico1') {
                const helico2Id = await roles.getSpeRankByName('helico2');
                if(member.roles.cache.has(helico2Id[0].role_id)) {
                    const embed = emb.generate(`Désolé :(`, null, `${user} est déjà <@&${helico2Id[0].role_id}>, si vous souhaitez vraiment le rétrograder merci de faire un </demote:> !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                    await interaction.followUp({ embeds: [embed], ephemeral: true });
                    await wait(5000);
                    return await interaction.deleteReply();
                }
                privateText = startPrivateText + `de la formation ${role}`;
            }
            if(spe[0].id == 'helico2') {
                const helico1Id = await roles.getSpeRankByName('helico1');
                if(member.roles.cache.has(helico1Id[0].role_id)) {
                    privateText = startPrivateText + `de la formation ${role}`;
                } else {
                    text = start + `ses formations <@&${helico1Id[0].role_id}> et ${role} !`;
                    privateText = startPrivateText + `des formations <@&${helico1Id[0].role_id}> et ${role}`;
                    await member.roles.add(helico1Id[0].role_id);
                }
            }
            if(spe[0].id == 'psychology') {
                const ppaId = await roles.getSpeRankByName('ppa');
                await member.roles.add(ppaId[0].role_id);
            }
            if(spe[0].id == 'trauma') {
                const sortingId = await roles.getSpeRankByName('sorting');
                await member.roles.add(sortingId[0].role_id);
            }
            if(spe[0].id == 'ppa') { privateText = startPrivateText + `de la formation ${role}`; }
            if(spe[0].id == 'sorting') { privateText = startPrivateText + `de la formation ${role}`; }
            await member.roles.add(role.id);
            promoType = `**${user}** à bien reçu la spécialité ${role} !`;
        }

        if(type == 'rank') {
            if(!hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
                const embed = emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette partie de la commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }

            const currentRank = await roles.getDoctorRankByName(memberData[0].rank_id);
            const currentRole = await interaction.guild.roles.cache.get(currentRank[0].role_id);
            if(rank[0].position>currentRank[0].position) {
                const embed = emb.generate(`Désolé :(`, null, `Le grade ${role} est en dessous du grade ${currentRole} ce qui signifie qu'il s'agit d'une rétrogradation, si c'est réellement ce que vous souhaitez faire merci d'utiliser la commande dédiée à cela (</demote:>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }

            try {
                await memberChannel.setParent(rank[0].parent_channel_id);
            } catch (err) {
                logger.error(err);
                const embed = emb.generate(`Oups :(`, null, `Il semblerait que la catégorie pour les fiches de suivi des ${role} n'ait pas été définie/n'existe plus, si le problème persiste merci de bien vouloir le signaler à l'aide de la commande </report:${process.env.IRIS_DEBUG_COMMAND_ID}> !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                return await interaction.followUp({ embeds: [embed], ephemeral: true });
            }
            await member.roles.remove(currentRank[0].role_id);
            await member.roles.add(role.id);
            await doctor.updateRank(user.id, rank[0].id);
            workforce.generateWorkforce(interaction.guild);
            text = `⬆️ Félicitation à **${memberData[0].name}** qui devient ${role} !`;
            privateText = `Passage ${role}`;
            promoType = `**${user}** à bien été promu ${role} !`;
            contentText = `<@&${process.env.IRIS_LSMS_ROLE}>`;

        }

        const privateEmbed = emb.generate(null, null, privateText, role.color, null, null, `Promotion`, serverIcon, null, interaction.member.nickname, null, true);
        await memberChannel.send({ embeds: [privateEmbed] });

        const announceChanId = await channels.getChannel('IRIS_ANNOUNCEMENT_CHANNEL_ID');
        if(announceChanId[0] != null) {
            try {
                const chan = await interaction.guild.channels.cache.get(announceChanId[0].id);
                const respEmb = emb.generate(null, null, text, role.color, process.env.LSMS_LOGO_V2, null, `Annonce`, serverIcon, null, interaction.member.nickname, null, true);
                const msg = await chan.send({ content: contentText, embeds: [respEmb] });
                msg.react('👏');
            } catch (err) {
                logger.error(err);
                const embed = emb.generate(`Attention`, null, `La promotion à bien été effectuée mais il semblerait que le salon d'annonce ne soit pas à jour, pour corriger se problème veuillez le redéfinir via la commande </define:> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
        } else {
            const embed = emb.generate(`Attention`, null, `La promotion à bien été effectuée mais aucun salon d'annonce n'a été trouvé en base de donnée, pour corriger se problème veuillez le définir via la commande </define:> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        
        const embed = emb.generate(null, null, promoType, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
    },
};
