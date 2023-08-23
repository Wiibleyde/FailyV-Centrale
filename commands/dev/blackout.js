// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');
const service = require('../../modules/service');
const config = require('../../sql/config/config');
const ws = require('../../modules/commonRadioServer');
const bedsSql = require('../../sql/lit/lit');
//Récup des réactions
const btnCreator = require('../../modules/btnCreator');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const title = `BLACKOUT`;

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('blackout')
        .setDescription('[DEV ONLY] Enable or disable the blackout mode!'),
    async execute(interaction) {
        const isBlackout = service.isBlackout();
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        const client = interaction.client;
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);

        if(interaction.user.id != '461880599594926080' && interaction.user.id != '461807010086780930' && interaction.user.id != '368259650136571904') {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Cette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        interaction.deferReply({ ephemeral: true });
        service.setGen(true);
        const centraleChanId = await config.getChannel('IRIS_RADIO_CHANNEL_ID');
        const bcmsThreadId = await config.getChannel('bcms_beds_thread');
        const centraleMsgId = await bedsSql.getMessageId('lit');
        const bcmsMsgId = await bedsSql.getMessageId('lit_bcms');
        let bedsImg;
        let bedsChannel = process.env.IRIS_BLACKOUT_BEDS_CHANNEL_ID;
        if(isBlackout) { bedsChannel = process.env.IRIS_BEDS_CHANNEL_ID; }
        await interaction.guild.channels.cache.get(bedsChannel).messages.fetch({ limit: 1 }).then(messages => {
            if(messages.first() != null) {
                messages.first().attachments.map(bedImg => bedsImg = bedImg.attachment);
            }
        });

        let centraleMsg = null;
        let bcmsMsg = null;

        if(centraleChanId[0] != null && bcmsThreadId[0] != null && centraleMsgId[0] != null && bcmsMsgId[0] != null) {
            const centraleChan = guild.channels.cache.get(centraleChanId[0].id);
            const bcmsThread = guild.channels.cache.get(bcmsThreadId[0].id);
            centraleMsg = await centraleChan.messages.fetch(centraleMsgId[0].id);
            bcmsMsg = await bcmsThread.messages.fetch(bcmsMsgId[0].id);
        }

        const lsmsRole = guild.roles.cache.get(process.env.IRIS_LSMS_ROLE);

        if(isBlackout) {
            const response = 'Mode blackout désactivé !';
            const color = '#FF0000';
            const letters = await bedsSql.getLetters();
            await config.setBlackoutMode(0);
            ws.askRadioInfo('lsms-lspd-lscs');
            ws.askRadioInfo('lsms-bcms');
            const leftRole = guild.roles.cache.get(process.env.IRIS_LEFT_ROLE_ID);
            await lsmsRole.edit({
                name: 'LSMS',
                color: process.env.LSMS_COLORCODE,
            });
            await lsmsRole.edit({
                position: leftRole.rawPosition,
                hoist: false,
                mentionable: true
            });
            if(centraleMsg != null && bcmsMsg != null) {
                editBedsImage(letters, centraleMsg, bcmsMsg, bedsImg, interaction, response, color, serverIcon);
            }
        } else {
            const response = 'Mode blackout activé !';
            const color = '#0DE600';
            await config.setBlackoutMode(1);
            ws.askRadioInfo('lsms-lspd-lscs');
            ws.askRadioInfo('lsms-bcms');
            const offRole = guild.roles.cache.get(process.env.IRIS_OFF_ROLE_ID);
            await lsmsRole.edit({
                name: '\u200b',
                color: '#2B2D31',
            });
            await lsmsRole.edit({
                position: offRole.rawPosition + 1,
                hoist: true,
                mentionable: false
            });
            if(centraleMsg != null && bcmsMsg != null) {
                editBedsImage([], centraleMsg, bcmsMsg, bedsImg, interaction, response, color, serverIcon);
            }
        }

    },
};

async function editBedsImage(letters, centraleMsg, bcmsMsg, imgUrl, interaction, response, color, serverIcon) {
    let lettersArray1 = [];
    let lettersArray2 = [];
    let lettersArray3 = [];
    let lettersArray4 = [];
    for(r=0;r<letters.length;r++) {
        if(r<5) {
            lettersArray1.push(letters[r].letter);
        } else if(r<10) {
            lettersArray2.push(letters[r].letter);
        } else if(r<15) {
            lettersArray3.push(letters[r].letter);
        } else {
            lettersArray4.push(letters[r].letter);
        }
    }
    if(letters.length == 0) {
        await centraleMsg.edit({ content: imgUrl, components: [] });
        await bcmsMsg.edit({ content: imgUrl, components: [] });
        await interaction.followUp({ embeds: [emb.generate(null, null, response, color, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        await centraleMsg.edit({ content: imgUrl, components: [btns1] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1] });
        await interaction.followUp({ embeds: [emb.generate(null, null, response, color, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        await centraleMsg.edit({ content: imgUrl, components: [btns1, btns2] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2] });
        await interaction.followUp({ embeds: [emb.generate(null, null, response, color, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        await centraleMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        await interaction.followUp({ embeds: [emb.generate(null, null, response, color, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        await centraleMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        await interaction.followUp({ embeds: [emb.generate(null, null, response, color, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}