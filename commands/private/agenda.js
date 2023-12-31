//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des requêtes SQL
const sql = require('../../sql/agenda/agenda');
//Récup du formateur de noms
const format = require('../../modules/formatName');

const security = require('../../modules/service');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`agenda`)
        .setDescription(`Ajouter un décès à l'agenda`)
        .addStringOption(option =>
            option.setName(`identité`)
            .setDescription(`Prénom et nom de la personne`)
            .setRequired(true))
        .addStringOption(option =>
            option.setName(`responsables`)
            .setDescription(`Liste des personnes responsables`)
            .setRequired(true))
        .addStringOption(option =>
            option.setName(`autorisées`)
            .setDescription(`Liste des personnes autorisées`)
            .setRequired(true))
        .addStringOption(option =>
            option.setName(`confidentialité`)
            .setDescription(`Décès publique ou privé`)
            .addChoices(
                {
                    name: `Publique`,
                    value: `public`
                },
                {
                    name: `Privé`,
                    value: `private`
                }
            ).setRequired(true))
        .addStringOption(option =>
            option.setName(`donneur`)
            .setDescription(`Donneuse d'organes`)
            .addChoices(
                {
                    name: `Oui`,
                    value: `Oui`
                },
                {
                    name: `Non`,
                    value: `Non`
                }
            ).setRequired(true))
        .addStringOption(option =>
            option.setName(`traitement`)
            .setDescription(`Traitement du corps de la personne`)
            .setRequired(true))
        .addStringOption(option =>
            option.setName(`cause`)
            .setDescription(`Cause du décès de la personne`)
            .setRequired(true))
        .addStringOption(option =>
            option.setName(`service`)
            .setDescription(`Service qui a géré la personne`)
            .addChoices(
                {
                    name: `LSMS`,
                    value: `LSMS`
                },
                {
                    name: `BCMS`,
                    value: `BCMS`
                }
            ).setRequired(true))
        .addStringOption(option =>
            option.setName(`autre`)
            .setDescription(`Infos supplémentaires à renseigner ?`)
            .setRequired(false))
        .addStringOption(option =>
            option.setName(`date`)
            .setDescription(`Spécifier une date de décès autre qu'aujourd'hui (format : JJ/MM/AAAA)`)
            .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;
        const serverIconURL = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`;
        const agendaChannelId = await sql.getAgendaChannelId();
        const mairieDécèsChannelId = await sql.getMairieDécèsChannelId();
        const lspdChannelId = await sql.getLSPDChannelId();

        if(agendaChannelId[0] == null || mairieDécèsChannelId[0] == null || lspdChannelId[0] == null) {
            return interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Aucun identifiant pour les salons de gestion de l'agenda n'a été trouvé en base de donnée\nVeuillez faire un </report:1140480157367402507>, merci !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion décès`, serverIconURL, null, null, null, false)], ephemeral: true });
        }
        const agendaChan = guild.channels.cache.get(agendaChannelId[0].id);
        const mairieDécèsChan = guild.channels.cache.get(mairieDécèsChannelId[0].id);
        const lspdChan = guild.channels.cache.get(lspdChannelId[0].id);

        //Séparation du prénom et nom pour retour à la ligne
        let patientName = interaction.options.getString(`identité`).split(' ');
        let firstname = format.name(patientName.shift());
        let lastname;
        if(patientName[0] != null) {
            patientName = patientName.join(' ');
            lastname = format.name(patientName);
        } else {
            await interaction.followUp({ embeds: [emb.generate(`Erreur :(`, null, `Attention, il semblerait que vous n'ayez pas spécifié de **nom de famille** !\nFaites bien attention à spécifier le nom complet de la personne dans la commande !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, serverIconURL, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        const isUserExists = await sql.getByName(firstname + ' ' + lastname);

        if(isUserExists[0] != null) {
            await interaction.followUp({ embeds: [emb.generate(`Erreur :(`, null, `Attention, il semblerait que **${firstname} ${lastname}** soit déjà inscrit(e) dans l'agenda !\nSi vous souhaitez réélement recréer cette fiche, veuillez d'abord supprimer la précédente !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, serverIconURL, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        let confi;
        let confiDB;
        if(interaction.options.getString(`confidentialité`) == 'public') {
            confi = `Décès publique`;
            confiDB = 1;
        } else {
            confi = `Décès privé`;
            confiDB = 0;
        }

        let donDB;
        if(interaction.options.getString(`donneur`) == 'Oui') {
            donDB = 1;
        } else {
            donDB = 0;
        }

        let date;
        if(interaction.options.getString(`date`) != null) {
            const regexDate = /^(0[1-9]|1\d|2[0-8]|29(?=\/02\/(?!1[01345789]00|2[1235679]00)\d\d(?:[02468][048]|[13579][26]))|29(?!\/02)|30(?!\/02)|31(?=\/0[13578]|\/1[02]))\/(0[1-9]|1[0-2])\/([12]\d{3})$/gm;
            if(!regexDate.test(interaction.options.getString(`date`))) {
                await interaction.followUp({ embeds: [emb.generate(`Erreur :(`, null, `La date que vous avez spécifiée n'est pas une date valide !\n\nVous devez insérer une date au format **JJ/MM/AAAA**`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, serverIconURL, null, null, null, false)], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            } else {
                date = interaction.options.getString(`date`);
            }
        } else {
            //Get now date
            const now = new Date();
            let day = now.getDate()
            if (day < 10) day = '0' + day;
            let month = now.getMonth() + 1;
            if (month < 10) month = '0' + month;
            const year = now.getFullYear();
            date = day + '/' + month + '/' + year;
        }

        let service;
        if(interaction.options.getString(`service`) == 'LSMS') {
            service = '<:IrisLSMS:1133116950357213355> LSMS';
        } else {
            service = '<:IrisBCMS:1133150717125853297> BCMS';
        }

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel(`Définir la date`).setCustomId(`agEventDefine`).setStyle(ButtonStyle.Success).setEmoji(`📆`).setDisabled(false),
            new ButtonBuilder().setLabel(`Responsables contactés`).setCustomId(`agRespContact`).setStyle(ButtonStyle.Primary).setEmoji(`📱`).setDisabled(false),
            new ButtonBuilder().setLabel(`Supprimer`).setCustomId(`agDelete`).setStyle(ButtonStyle.Danger).setEmoji(`896393106633687040`).setDisabled(false)
        );

        const newEmbed = emb.generate(null, null, null, `#000001`, process.env.LSMS_DELTA_LOGO, null, `Gestion décès`, serverIconURL, null, interaction.member.nickname, null, false);
        newEmbed.addFields(
            {
                name: `**Identité**`,
                value: firstname + ' ' + lastname,
                inline: true
            },
            {
                name: `**Date du décès**`,
                value: date,
                inline: true
            },
            {
                name: `**Traité par**`,
                value: service,
                inline: true
            },
            {
                name: `**Personnes responsables**`,
                value: interaction.options.getString(`responsables`),
                inline: false
            },
            {
                name: `**Personnes autorisées**`,
                value: interaction.options.getString(`autorisées`),
                inline: false
            },
            {
                name: `**Confidentialité**`,
                value: confi,
                inline: true
            },
            {
                name: `**Donneur·se**`,
                value: interaction.options.getString(`donneur`),
                inline: true
            },
            {
                name: `**Traitement**`,
                value: interaction.options.getString(`traitement`),
                inline: false
            },
            {
                name: `**Cause du décès**`,
                value: interaction.options.getString(`cause`),
                inline: false
            },
        );
        if(interaction.options.getString(`autre`) != null) {
            newEmbed.addFields(
                {
                    name: `**Infos complémentaires**`,
                    value: interaction.options.getString(`autre`),
                    inline: false
                }
            );
        }
        security.setGen(true);
        const agendaID = await agendaChan.send({ embeds: [newEmbed], components: [buttons] });
        newEmbed.spliceFields(3, 7);
        newEmbed.addFields(
            {
                name: `**Confidentialité**`,
                value: confi,
                inline: false
            }
        );
        const mayorID = await mairieDécèsChan.send({ embeds: [newEmbed] });
        newEmbed.spliceFields(3, 1);
        newEmbed.addFields(
            {
                name: `**Cause du décès**`,
                value: interaction.options.getString(`cause`),
                inline: false
            }
        );
        const LSPDID = await lspdChan.send({ embeds: [newEmbed] });

        //Sauvegarde en DB
        date = date.split('/');
        date = date[1] + '/' + date[0] + '/' + date[2];
        const sqlDate = new Date(`${date} UTC+0:00`).toISOString().slice(0, 19).replace('T', ' ');
        if(interaction.options.getString(`autre`) != null) {
            sql.insert(firstname + ' ' + lastname, sqlDate, interaction.options.getString(`service`), interaction.options.getString(`responsables`), interaction.options.getString(`autorisées`), confiDB, donDB, interaction.options.getString(`traitement`), interaction.options.getString(`cause`), interaction.member.nickname, agendaID.id, mayorID.id, LSPDID.id);
        } else {
            sql.insertWithDetails(firstname + ' ' + lastname, sqlDate, interaction.options.getString(`service`), interaction.options.getString(`responsables`), interaction.options.getString(`autorisées`), confiDB, donDB, interaction.options.getString(`traitement`), interaction.options.getString(`cause`), interaction.options.getString(`autre`), interaction.member.nickname, agendaID.id, mayorID.id, LSPDID.id);
        }
        security.setGen(false);

        await interaction.followUp({ embeds: [emb.generate(null, null, `Agenda mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, serverIconURL, null, null, null, false)], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
    },
};
