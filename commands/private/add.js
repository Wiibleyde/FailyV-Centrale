//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ChannelType } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
// Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du générateur d'effectif
const workforce = require('../../modules/workforce');
//Récup des requêtes SQL
const doctorCardSql = require('../../sql/doctorManagement/doctorCard');
const doctorRankSql = require('../../sql/doctorManagement/doctorRank');
const doctorSql = require('../../sql/doctorManagement/doctor');
//Récup du SQL pour les channels
const sql = require('../../sql/config/config');

const format = require('../../modules/formatName');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription("[Direction] Ajouter un membre à l'effectif")
        .addStringOption(option =>
            option.setName("personne")
                .setDescription("Prénom et Nom de la personne à ajouter")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("telephone")
                .setDescription("Numéro de la personne sous la forme : 555-XXXX")
                .setMinLength(4)
                .setMaxLength(8)
                .setRequired(true))
        .addUserOption(option =>
            option.setName("tag")
                .setDescription("Tag de la personne")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("grade")
                .setDescription("Grade de la personne")
                .addChoices(
                    { name: "Interne", value: "intern" },
                    { name: "Résident", value: "resident" },
                    { name: "Titulaire", value: "incumbent" },
                    { name: "Spécialiste", value: "specialist" },
                    { name: "Chef de service", value: "departement_manager" },
                    { name: "Directeur adjoint", value: "assistant_manager" },
                    { name: "Directeur", value: "director" },
                )),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });

        //Récupération du channel 
        let IRIS_ANNOUNCEMENT_CHANNEL_ID = await sql.getChannel('IRIS_ANNOUNCEMENT_CHANNEL_ID');
        if (IRIS_ANNOUNCEMENT_CHANNEL_ID[0] == undefined) {
            const embed = emb.generate("Désolé :(", null, `Aucun channel n'a été trouvé dans la base de donnée, veuillez contacter un de mes développeur (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour corriger ce problème !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des employés`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false);
            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
            IRIS_ANNOUNCEMENT_CHANNEL_ID = IRIS_ANNOUNCEMENT_CHANNEL_ID[0].id;
        }
        
        // Check si l'utilisateur est chef de service ou plus
        if (!hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
            const embed = emb.generate("Désolé :(", null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des employés`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false);
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        }

        const doctorCardData = await doctorCardSql.getDoctorCard();
        const doctorRankData = await doctorRankSql.getDoctorRank();

        if(doctorRankData == null) {
            const embed = emb.generate("Désolé :(", null, `Aucun grade n'a été trouvé dans la base de donnée, veuillez contacter un de mes développeur (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour corriger ce problème !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des employés`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false);
            return await interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const tag = interaction.options.getUser("tag");

        // Check si le tag discord pour le docteur n'est pas le bot
        if (tag.id === process.env.IRIS_DISCORD_ID) {
            const embed = emb.generate("Erreur", null, `Vous ne pouvez pas utiliser le tag ${tag} pour ajouter un nouveau docteur`, "#FF0000", process.env.LSMS_LOGO_V2, null, null, null, null, null, null, false);
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        }

        const phone = interaction.options.getString("telephone");
        //Regex des numéros de téléphone
        const regExpFull = new RegExp("^555-[0-9]{4}$");
        const regExpMidFull = new RegExp("^555[0-9]{4}$");
        const regExp = new RegExp("^[0-9]{4}$");

        // Check si le numéro de téléphone est bien sous le bon format
        if (!regExpFull.test(phone) && !regExpMidFull.test(phone) && !regExp.test(phone)) {
            try {
                await interaction.reply({ content: `Le numéro de téléphone ${phone} est invalide. Veuillez entrer un numéro de téléphone valide (555-5420 ou 5555420 ou 5420).`, ephemeral: true });
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

        const name = format.name(interaction.options.getString('personne'))

        const existChannelID = await doctorSql.getDoctorChannelID(phoneNumber);

        // Check si une fiche n'existe pas déjà pour le docteur
        if (existChannelID !== "-1") {
            const embed = emb.generate("Erreur", null, `Il existe déjà un docteur du nom de ${name} sa fiche se trouve ici : <#${existChannelID}>`, "#FF0000", process.env.LSMS_LOGO_V2, null, null, null, null, null, null, false);
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        }

        const grade = interaction.options.getString("grade") ?? "intern";
        const arrivalDate = new Date();

        // Renomage de l'utilisateur et ajout des rôles LSMS et correspondant au grade du docteur
        const newMember = interaction.guild.members.cache.get(tag.id);
        newMember.setNickname(`${name}`);
        await newMember.roles.add([process.env.IRIS_LSMS_ROLE, doctorRankData[grade].role_id]);

        // Creation de la fiche du docteur
        const channel = await interaction.guild.channels.create({
            name: `${name}`,
            type: ChannelType.GuildText,
            parent: doctorRankData[grade].parent_channel_id,
            topic: `Rentré au LSMS le : ${arrivalDate.toLocaleDateString("fr-FR")}`
        });

        // Ajout des information du docteur en base de donnée
        await doctorSql.addDoctor(name, phoneNumber, grade, tag.id, arrivalDate, channel.id);

        workforce.generateWorkforce(interaction.guild);

        // Message de bienvenue
        const welcomeEmbed = emb.generate(
            null,
            null,
            `:new: Bienvenue à **${name}** nous rejoint en tant que <@&${doctorRankData[grade].role_id}> :wave:`,
            interaction.guild.roles.cache.get(doctorRankData[grade].role_id).hexColor,
            process.env.LSMS_LOGO_V2, null,
            "Annonce",
            `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`,
            null,
            `${interaction.member.nickname}`,
            null,
            true
        );
        const welcomeMessage = await interaction.client.channels.cache.get(IRIS_ANNOUNCEMENT_CHANNEL_ID).send({ content: `<@&${process.env.IRIS_LSMS_ROLE}>`, embeds: [welcomeEmbed] });
        welcomeMessage.react("👋");

        // Création de la fiche d'interne
        let message;
        for (const [_, value] of Object.entries(doctorCardData)) {
            const embed = emb.generate(value.name, null, null, value.color, null, null, null, null, null, null, null, false);
            if (value.position === 0) {
                message = await channel.send({ embeds: [embed] });
            } else {
                await channel.send({ embeds: [embed] });
            }
            for (const i in value.elements) {
                await channel.send(`- ${value.elements[i]}`);
            }
        }
        await message.pin();
        channel.messages.fetch({ limit: 1 }).then(messages => {
                let lastMessage = messages.first();
                
                if (lastMessage.author.bot) {
                    lastMessage.delete();
                }
            })
            .catch(logger.error);

        // Confirmation de la création
        const validationEmbed = emb.generate("Succès", null, `La fiche de **${name}** a bien été créé (<#${channel.id}>) !`, "#0CE600", process.env.LSMS_LOGO_V2, null, null, null, null, null, null, false);
        await interaction.editReply({ embeds: [validationEmbed], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    },
};
