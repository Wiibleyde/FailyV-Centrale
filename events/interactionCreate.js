//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

module.exports = {
    //Dès qu'une interaction Discord avec le bot est executée
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        const cID = interaction.customId;
        //Lorsqu'il s'agit d'une commande
        if(interaction.isChatInputCommand()) {
            //Log dès l'utilisation de la commande
            logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) la commande "/${interaction.commandName}"`);
            const command = interaction.client.commands.get(interaction.commandName);
    
            if(!command) { logger.error(`Aucune commande correspondante à ${interaction.commandName} n'a été trouvée !`); return; }
    
            try {
                //Execution de la commande
                await command.execute(interaction);
            } catch(err) {
                //Lors d'une erreur
                logger.error(err);
                const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'execution de la commande "**</${interaction.commandName}:${interaction.commandId}>**", si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance <:green_heart:1112687922651594762>)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
                if(interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errEmb], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errEmb], ephemeral: true });
                }
            }
        }

        //Possible d'optimiser
        //Lorsqu'il s'agit d'un Modal
        if(interaction.isModalSubmit()) {
            //Log dès l'utilisation du Modal
            logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) le Modal "${cID}"`);
            //Pré-écriture d'un message d'erreur (pour éviter de l'écrire dans tout les fichers)
            const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'interaction avec la fenêtre pop-up, si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance <:green_heart:1112687922651594762>)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
            //Appel du fichier spécifique pour chaques interactions
            if(cID == 'debugModal') { const debugModal = require('./../modals/debugModal'); debugModal.execute(interaction, errEmb); }
            if(cID == 'rendezVousPsyModal') { const rendezVousPsyModal = require('../modals/rendezVousPsyModal'); rendezVousPsyModal.execute(interaction, errEmb); }
            if(cID == 'rendezVousChirModal') { const rendezVousChirModal = require('../modals/rendezVousChirModal'); rendezVousChirModal.execute(interaction, errEmb); }
            if(cID == 'rendezVousGenModal') { const rendezVousGenModal = require('../modals/rendezVousGenModal'); rendezVousGenModal.execute(interaction, errEmb); }
        }
        //Lorsqu'il s'agit d'un bouton
        if(interaction.isButton()) {
            //Log dès l'utilisation du bouton
            logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) le bouton "${cID}"`);
            //Pré-écriture d'un message d'erreur (pour éviter de l'écrire dans tout les fichers)
            const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'interaction avec le bouton, si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance <:green_heart:1112687922651594762>)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
            //Appel du fichier spécifique pour chaques interactions
            if(cID == 'checkDebug') { const checkDebug = require('./../buttons/checkDebug'); checkDebug.execute(interaction, errEmb); }
            if(cID == 'checkDebug6h') { const checkDebug6h = require('./../buttons/checkDebug'); checkDebug6h.execute(interaction, errEmb); }
            if(cID == 'denyDebug') { const denyDebug = require('./../buttons/denyDebug'); denyDebug.execute(interaction, errEmb); }
            if(cID == 'regenLSMS') { const serviceRegen = require('./../buttons/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'regenFDO') { const serviceRegen = require('./../buttons/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'regenBCMS') { const serviceRegen = require('./../buttons/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'regenEvent') { const serviceRegen = require('./../buttons/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'serviceManage') { const serviceManage = require('./../buttons/serviceManage'); serviceManage.execute(interaction, errEmb); }
            if(cID == 'serviceRadioReset') { const serviceRadioReset = require('./../buttons/serviceRadioReset'); serviceRadioReset.execute(interaction, errEmb); }
            if(cID == 'serviceSwitch') { const serviceSwitch = require('./../buttons/serviceSwitch'); serviceSwitch.execute(interaction, errEmb); }
            if(cID == 'serviceDispatch') { const serviceDispatch = require('./../buttons/serviceDispatch'); serviceDispatch.execute(interaction, errEmb); }
            if(cID == 'serviceSwitchOff') { const serviceSwitchOff = require('./../buttons/serviceSwitchOff'); serviceSwitchOff.execute(interaction, errEmb); }
            if(cID == 'rendezVousAnnule') { const rendezVousAnnule = require('./../buttons/rendezVousAnnule'); rendezVousAnnule.execute(interaction, errEmb); }
            if(cID == 'rendezVousPris') { const rendezVousPris = require('./../buttons/rendezVousPris'); rendezVousPris.execute(interaction, errEmb); }
            if(cID == 'rendezVousContacte') { const rendezVousContacte = require('./../buttons/rendezVousContacte'); rendezVousContacte.execute(interaction, errEmb); }
            if(cID == 'rendezVousFini') { const rendezVousFini = require('./../buttons/rendezVousFini'); rendezVousFini.execute(interaction, errEmb); }
            if(cID == 'a' || cID == 'b' || cID == 'c' || cID == 'd' || cID == 'e' || cID == 'f' || cID == 'g' || cID == 'h' || cID == 'i' || cID == 'j' || cID == 'k' || cID == 'l' || cID == 'm' || cID == 'n' || cID == 'o' || cID == 'p' || cID == 'q' || cID == 'r') { const btnsLit = require('./../buttons/btnsLit'); btnsLit.execute(interaction, errEmb); }
        }
        //Lorsqu'il s'agit d'un Select Menu
        if(interaction.isChannelSelectMenu() || interaction.isStringSelectMenu()) {
            //Log dès l'utilisation du Select Menu
            logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) le menu de séléction "${cID}"`);
            //Pré-écriture d'un message d'erreur (pour éviter de l'écrire dans tout les fichers)
            const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'interaction avec le menu de séléction, si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance <:green_heart:1112687922651594762>)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
            //Appel du fichier spécifique pour chaques interactions
            if(cID == 'serviceKickSingleSelect') { const serviceKickSingleSelect = require('./../selectMenus/serviceKickSingleSelect'); serviceKickSingleSelect.execute(interaction, errEmb); }
            if(cID == 'centraleResetRadioSelect') { const centraleResetRadioSelect = require('./../selectMenus/centraleResetRadioSelect'); centraleResetRadioSelect.execute(interaction, errEmb); }
        }

    },
};