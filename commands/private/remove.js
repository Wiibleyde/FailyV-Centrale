// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');
// Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Importation du module pour kick du service
const kickservice = require('../../modules/kickservice');

const config = require('../../sql/config/config');
const doctor = require('../../sql/doctorManagement/doctor');

const workforce = require('../../modules/workforce');

const service = require('../../modules/service');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription(`[Direction] Retirer une personne de l'effectif du LSMS`)
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à retirer')
            .setRequired(true)
        ).addNumberOption(option => 
            option.setName('type')
            .setDescription('Le type de départ de la personne')
            .addChoices(
                {
                    name: 'Démission',
                    value: 0
                },
                {
                    name: 'Licenciement',
                    value: 1
                },
                {
                    name: 'Décès',
                    value: 2
                }
            )
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('motif')
            .setDescription(`La raison du retrait de la personne de l'effectif`)
            .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serverIcon = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`;
        const title = `Gestion des employés`;
        const type = interaction.options.getNumber('type');
        const reason = interaction.options.getString('motif');

        if(!hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
            const embed = emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(service.isGen()) {
            const embed = emb.generate(`Désolé :(`, null, `Il y a déjà quelque chose en cours de régénération, veuillez patienter quelques secondes puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const user = interaction.options.getUser('membre');
        const memberData = await doctor.getDataByDiscordId(user.id);
        const member = await interaction.guild.members.cache.get(user.id);

        if(user.id == process.env.IRIS_DISCORD_ID) {
            const embed = emb.generate(`Attention`, null, `Vous êtes sûr de vouloir me virer <:Sadge:1138631197392650381> ? Je pense que vous allez avoir quelques problèmes si vous faites ceci !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(user.id == interaction.user.id) {
            const embed = emb.generate(`Désolé :(`, null, `Vous ne pouvez pas vous retirer vous même de l'effectif, demandez à un de vos collègues de le faire !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(memberData[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `La personne que vous avez sélectionnée ne fait pas partie de l'effectif du LSMS, veuillez vérifier la personne que vous souhaitez virer puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        const memberChannel = interaction.guild.channels.cache.get(memberData[0].channel_id);
        const staffRepresentativeChannelId = await config.getChannel('staff_representative');
        if(staffRepresentativeChannelId[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `Il semblerait que le salon du/des délégué(s) du personnel n'est pas défini hors il doit l'être pour effectuer une sanction !\nPour le définir veuillez utiliser la commande </define:${process.env.IRIS_DEFINE_COMMAND_ID}>`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const archivesCatId = await config.getCategory('archives');

        if(archivesCatId[0] == null) {
            const embed = emb.generate(`Désolé :(`, null, `Il semblerait que la catégorie pour les **archives** n'ait pas été définie, si le problème persiste merci de bien vouloir le signaler à l'aide de la commande </report:${process.env.IRIS_DEBUG_COMMAND_ID}> !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        let text = '';
        let privateText = '';
        let textReason;

        if(type == 0) {
            text = `⬅️ Démission`;
            privateText = 'Démission';
            textReason = 'Motif personnel';
        }
        if(type == 1) {
            text = `⬅️ Licenciement`;
            privateText = 'Licenciement';
            if(reason == null) {
                const embed = emb.generate(`Désolé :(`, null, `Vous devez obligatoirement spécifier un motif de licenciement !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
        }
        if(type == 2) {
            text = `<:rip:1138856780257050624> Nous avons le regret de vous annoncer le décès`;
            privateText = 'Décès';
            if(reason == null) {
                const embed = emb.generate(`Désolé :(`, null, `Vous devez obligatoirement spécifier la cause du décès !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            }
        }

        try {
            let pos = await doctor.getAllDoctorRemoved();
            pos = pos.length;
            await memberChannel.setParent(archivesCatId[0].id);
            if(memberData[0].rank_id == 'intern') {
                await memberChannel.permissionOverwrites.set([
                    { id: process.env.IRIS_PRIVATE_GUILD_ID, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads] },
                    { id: process.env.IRIS_RESIDENT_ROLE, allow: [PermissionsBitField.Flags.ViewChannel]},
                    { id: process.env.IRIS_INCUMBENT_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_SPECIALIST_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DEPARTEMENT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_ASSISTANT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DIRECTOR_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }
                ]);
            } else if(memberData[0].rank_id == 'resident') {
                await memberChannel.permissionOverwrites.set([
                    { id: process.env.IRIS_PRIVATE_GUILD_ID, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads] },
                    { id: process.env.IRIS_INCUMBENT_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_SPECIALIST_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DEPARTEMENT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_ASSISTANT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DIRECTOR_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }
                ]);
            } else if(memberData[0].rank_id == 'incumbent') {
                await memberChannel.permissionOverwrites.set([
                    { id: process.env.IRIS_PRIVATE_GUILD_ID, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads] },
                    { id: process.env.IRIS_SPECIALIST_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DEPARTEMENT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_ASSISTANT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DIRECTOR_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }
                ]);
            } else if(memberData[0].rank_id == 'specialist') {
                await memberChannel.permissionOverwrites.set([
                    { id: process.env.IRIS_PRIVATE_GUILD_ID, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads] },
                    { id: process.env.IRIS_DEPARTEMENT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_ASSISTANT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DIRECTOR_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }
                ]);
            } else {
                await memberChannel.permissionOverwrites.set([
                    { id: process.env.IRIS_PRIVATE_GUILD_ID, allow: [PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageThreads] },
                    { id: process.env.IRIS_ASSISTANT_MANAGER_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: process.env.IRIS_DIRECTOR_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }
                ]);
            }
            await memberChannel.setPosition(pos);
        } catch (err) {
            logger.error(err);
            const embed = emb.generate(`Oups :(`, null, `Il semblerait que la catégorie pour les **archives** n'existe plus, si le problème persiste merci de bien vouloir le signaler à l'aide de la commande </report:${process.env.IRIS_DEBUG_COMMAND_ID}> !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            return await interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        await doctor.removeDoctor(user.id, new Date());
        
        let roles = member.roles.cache;

        if(member.roles.cache.has(process.env.IRIS_SERVICE_ROLE_ID)) {
            //Kick le docteur du service
            await kickservice.kickSomeone(member, interaction.guild, interaction.member, false);
            //Refresh la liste des rôles
            roles = member.roles.cache;
        }
        //Parse json to array process.env.IRIS_VACANCES_EXCLUDE_ROLES_ID
        let excludeRoles = process.env.IRIS_VACANCES_EXCLUDE_ROLES_ID.split(',');
        //Pour chaque rôle de la guild
        roles.forEach(async role => {
            if (role.id != process.env.IRIS_PRIVATE_GUILD_ID) {
                if (!excludeRoles.includes(role.id)) {
                    await member.roles.remove(role.id);
                }
            }
        });

        const privateEmbed = emb.generate(null, null, null, `#FF0000`, null, null, `Départ`, serverIcon, null, interaction.member.nickname, null, true);
        const respEmb = emb.generate(null, null, null, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Annonce`, serverIcon, null, interaction.member.nickname, null, true);

        if(reason != null) {
            textReason = reason;
        }

        privateEmbed.addFields({name: '**Type**', value: privateText, inline: false}, { name: '**Motif**', value: textReason, inline: false });
        respEmb.setDescription(text + ` de **${memberData[0].name}**`);
        respEmb.addFields({ name: '**Motif**', value: textReason, inline: false });

        await memberChannel.send({ embeds: [privateEmbed] });

        if(privateText == 'Licenciement') {
            privateEmbed.setAuthor({ name: privateText, iconURL: serverIcon });
            privateEmbed.spliceFields(0,2);
            privateEmbed.addFields({name: '**Membre**', value: memberData[0].name, inline: false}, { name: '**Motif**', value: textReason, inline: false });
            const staffRepresentativeChannel = interaction.guild.channels.cache.get(staffRepresentativeChannelId[0].id);
            await staffRepresentativeChannel.send({ embeds: [privateEmbed] });
        }

        const announceChanId = await config.getChannel('IRIS_ANNOUNCEMENT_CHANNEL_ID');
        if(announceChanId[0] != null) {
            try {
                const chan = await interaction.guild.channels.cache.get(announceChanId[0].id);
                const msg = await chan.send({ content: `<@&${process.env.IRIS_LSMS_ROLE}>`, embeds: [respEmb] });
                if(privateText == 'Licenciement') {
                    try {
                        await msg.react('<:yes:1139625753181433998>');
                    } catch (err2) {
                        logger.error(err2);
                        await msg.react('✅');
                    }
                } else {
                    msg.react('❤️');
                }
            } catch (err) {
                logger.error(err);
                const embed = emb.generate(`Attention`, null, `Le retrait de l'effectif à bien été effectuée mais il semblerait que le salon d'annonce ne soit pas à jour, pour corriger se problème veuillez le redéfinir via la commande </define:${process.env.IRIS_DEFINE_COMMAND_ID}> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
                await interaction.followUp({ embeds: [embed], ephemeral: true });
                await wait(5000);
                await interaction.deleteReply();
            }
        } else {
            const embed = emb.generate(`Attention`, null, `Le retrait de l'effectif à bien été effectuée mais aucun salon d'annonce n'a été trouvé en base de donnée, pour corriger se problème veuillez le définir via la commande </define:${process.env.IRIS_DEFINE_COMMAND_ID}> !`, `Gold`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }

        await member.roles.add(process.env.IRIS_LEFT_ROLE_ID);

        service.setGen(true);
        await workforce.generateWorkforce(interaction.guild, interaction);
        service.setGen(false);

        const embed = emb.generate(null, null, `${user} à bien été retiré de l'effectif !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
    },
};
