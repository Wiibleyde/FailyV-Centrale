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
        const cName = interaction.commandName;
        //Lorsqu'il s'agit d'une commande
        if(interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand() || interaction.isChatInputContextMenuCommand()) {
            //Log dès l'utilisation de la commande
            logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) la commande "/${cName}"`);
            const command = interaction.client.commands.get(cName);
    
            if(!command) { logger.error(`Aucune commande correspondante à ${cName} n'a été trouvée !`); return; }
    
            try {
                //Execution de la commande
                await command.execute(interaction);
            } catch(err) {
                //Lors d'une erreur
                logger.error(err);
                const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'execution de la commande "**</${cName}:${interaction.commandId}>**", si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance 💙)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
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
            logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) le Modal "${cID}"`);
            //Pré-écriture d'un message d'erreur (pour éviter de l'écrire dans tout les fichers)
            const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'interaction avec la fenêtre pop-up, si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance 💙)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
            //Appel du fichier spécifique pour chaques interactions
            if(cID == 'debugModal') { const debugModal = require('./../modals/debug/debugModal'); debugModal.execute(interaction, errEmb); }
            if(cID == 'rendezVousPsyModal') { const rendezVousPsyModal = require('./../modals/rdv/rendezVousPsyModal'); rendezVousPsyModal.execute(interaction, errEmb); }
            if(cID == 'rendezVousChirModal') { const rendezVousChirModal = require('./../modals/rdv/rendezVousChirModal'); rendezVousChirModal.execute(interaction, errEmb); }
            if(cID == 'rendezVousGenModal') { const rendezVousGenModal = require('./../modals/rdv/rendezVousGenModal'); rendezVousGenModal.execute(interaction, errEmb); }
            if(cID == 'vehiculeAddModal') { const vehiculeAddModal = require('./../modals/vehicule/vehiculeAddModal'); vehiculeAddModal.execute(interaction, errEmb); }
            if(cID == 'vehiculeEditModal') { const vehiculeEditModal = require('./../modals/vehicule/vehiculeEditModal'); vehiculeEditModal.execute(interaction, errEmb); }
            if(cID == 'vehEditCtModal') { const vehEditCtModal = require('./../modals/vehicule/vehEditCtModal'); vehEditCtModal.execute(interaction, errEmb); }
            if(cID == 'renameModal') { const renameModal = require('./../modals/rename/renameModal'); renameModal.execute(interaction, errEmb); }
            if(cID == 'agEventDefineModal') { const agEventDefineModal = require('./../modals/agenda/agEventDefineModal'); agEventDefineModal.execute(interaction, errEmb); }
            if(cID == 'updateInspeModal') { const updateInspeModal = require('./../modals/inspection/updateInspeModal'); updateInspeModal.execute(interaction, errEmb); }
            if(cID == 'addFeatureModal') { const addFeatureModal = require('./../modals/patchnote/addFeatureModal'); addFeatureModal.execute(interaction, errEmb); }
            if(cID == 'updateFeatureModal') { const updateFeatureModal = require('./../modals/patchnote/updateFeatureModal'); updateFeatureModal.execute(interaction, errEmb); }
            if(cID == 'addPatchnoteModal') { const addPatchnoteModal = require('./../modals/patchnote/addPatchnoteModal'); addPatchnoteModal.execute(interaction, errEmb); }
        }
        //Lorsqu'il s'agit d'un bouton
        if(interaction.isButton()) {
            //Log dès l'utilisation du bouton
            logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) le bouton "${cID}"`);
            //Pré-écriture d'un message d'erreur (pour éviter de l'écrire dans tout les fichers)
            const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'interaction avec le bouton, si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance 💙)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
            //Appel du fichier spécifique pour chaques interactions
            if(cID == 'checkDebug') { const checkDebug = require('./../buttons/debug/checkDebug'); checkDebug.execute(interaction, errEmb); }
            if(cID == 'checkDebug6h') { const checkDebug6h = require('./../buttons/debug/checkDebug'); checkDebug6h.execute(interaction, errEmb); }
            if(cID == 'denyDebug') { const denyDebug = require('./../buttons/debug/denyDebug'); denyDebug.execute(interaction, errEmb); }
            if(cID == 'regenLSMS') { const serviceRegen = require('./../buttons/radio/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'regenFDO') { const serviceRegen = require('./../buttons/radio/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'regenBCMS') { const serviceRegen = require('./../buttons/radio/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'regenEvent') { const serviceRegen = require('./../buttons/radio/serviceRegen'); serviceRegen.execute(interaction, errEmb); }
            if(cID == 'serviceManage') { const serviceManage = require('./../buttons/service/serviceManage'); serviceManage.execute(interaction, errEmb); }
            if(cID == 'serviceRadioReset') { const serviceRadioReset = require('./../buttons/radio/serviceRadioReset'); serviceRadioReset.execute(interaction, errEmb); }
            if(cID == 'serviceSwitch') { const serviceSwitch = require('./../buttons/service/serviceSwitch'); serviceSwitch.execute(interaction, errEmb); }
            if(cID == 'serviceDispatch') { const serviceDispatch = require('./../buttons/service/serviceDispatch'); serviceDispatch.execute(interaction, errEmb); }
            if(cID == 'serviceSwitchOff') { const serviceSwitchOff = require('./../buttons/service/serviceSwitchOff'); serviceSwitchOff.execute(interaction, errEmb); }
            if(cID == 'rendezVousPris') { const rendezVousPris = require('./../buttons/rdv/rendezVousPris'); rendezVousPris.execute(interaction, errEmb); }
            if(cID == 'rendezVousContacte') { const rendezVousContacte = require('./../buttons/rdv/rendezVousContacte'); rendezVousContacte.execute(interaction, errEmb); }
            if(cID == 'rendezVousFini') { const rendezVousFini = require('./../buttons/rdv/rendezVousFini'); rendezVousFini.execute(interaction, errEmb); }
            if(cID == 'a' || cID == 'b' || cID == 'c' || cID == 'd' || cID == 'e' || cID == 'f' || cID == 'g' || cID == 'h' || cID == 'i' || cID == 'j' || cID == 'k' || cID == 'l' || cID == 'm' || cID == 'n' || cID == 'o' || cID == 'p' || cID == 'q' || cID == 'r') { const btnsLit = require('./../buttons/lit/btnsLit'); btnsLit.execute(interaction, errEmb); }
            if(cID == 'vehAvailable' || cID == 'vehNeedRepair' || cID == 'vehUnavailable') { const vehStateUpdate = require('./../buttons/vehicule/vehStateUpdate'); vehStateUpdate.execute(interaction, errEmb); }
            if(cID == 'vehEditCt') { const vehEditCt = require('./../buttons/vehicule/vehEditCt'); vehEditCt.execute(interaction, errEmb); }
            if(cID == 'agRespContact') { const agRespContact = require('./../buttons/agenda/agRespContact'); agRespContact.execute(interaction, errEmb); }
            if(cID == 'agDelete') { const agDelete = require('./../buttons/agenda/agDelete'); agDelete.execute(interaction, errEmb); }
            if(cID == 'agEventDefine') { const agEventDefine = require('./../buttons/agenda/agEventDefine'); agEventDefine.execute(interaction, errEmb); }
            if(cID == 'followRemoveOrgans') { const followRemoveOrgans = require('./../buttons/suivi/followRemoveOrgans'); followRemoveOrgans.execute(interaction, errEmb); }
            if(cID == 'followRemoveOrgansPatient') { const followRemoveOrgansPatient = require('./../buttons/suivi/followRemoveOrgansPatient'); followRemoveOrgansPatient.execute(interaction, errEmb); }
            if(cID == 'followRemovePPAPatient') { const followRemovePPAPatient = require('./../buttons/suivi/followRemovePPAPatient'); followRemovePPAPatient.execute(interaction, errEmb); }
            if(cID == 'followUpdateSecoursForma') { const followUpdateSecoursForma = require('./../buttons/suivi/followUpdateSecoursForma'); followUpdateSecoursForma.execute(interaction, errEmb); }
            if(cID == 'followRemoveSecoursForma') { const followRemoveSecoursForma = require('./../buttons/suivi/followRemoveSecoursForma'); followRemoveSecoursForma.execute(interaction, errEmb); }
            if(cID == 'followUpdateSecoursPatient') { const followUpdateSecoursPatient = require('./../buttons/suivi/followUpdateSecoursPatient'); followUpdateSecoursPatient.execute(interaction, errEmb); }
            if(cID == 'followRemoveSecoursPatient') { const followRemoveSecoursPatient = require('./../buttons/suivi/followRemoveSecoursPatient'); followRemoveSecoursPatient.execute(interaction, errEmb); }
        }
        //Lorsqu'il s'agit d'un Select Menu
        if(interaction.isChannelSelectMenu() || interaction.isStringSelectMenu()) {
            //Log dès l'utilisation du Select Menu
            logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) le menu de séléction "${cID}"`);
            //Pré-écriture d'un message d'erreur (pour éviter de l'écrire dans tout les fichers)
            const errEmb = emb.generate(`Oups! Une erreur s'est produite :(`, null, `Il semblerait qu'une erreur se soit produite lors de l'interaction avec le menu de séléction, si le problème persiste n'hésitez pas à faire une demande de débug via le </debug:${process.env.IRIS_DEBUG_COMMAND_ID}> avec le plus de détails possible ! (Merci d'avance 💙)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
            //Appel du fichier spécifique pour chaques interactions
            if(cID == 'serviceKickSingleSelect') { const serviceKickSingleSelect = require('../buttons/service/serviceManage'); serviceKickSingleSelect.execute(interaction, errEmb); }
            if(cID == 'centraleResetRadioSelect') { const centraleResetRadioSelect = require('../buttons/radio/serviceRadioReset'); centraleResetRadioSelect.execute(interaction, errEmb); }
            if(cID == 'vehiculeRemoveSelect') { const vehiculeRemoveSelect = require('../commands/private/vehicule'); vehiculeRemoveSelect.execute(interaction, errEmb); }
            if(cID == 'followRemoveOrgansSelect') { const followRemoveOrgansSelect = require('../buttons/suivi/followRemoveOrgans'); followRemoveOrgansSelect.execute(interaction, errEmb); }
            if(cID == 'followRemoveOrgansPatientSelect') { const followRemoveOrgansPatientSelect = require('../buttons/suivi/followRemoveOrgansPatient'); followRemoveOrgansPatientSelect.execute(interaction, errEmb); }
            if(cID == 'followRemovePPAPatientSelect') { const followRemovePPAPatientSelect = require('../buttons/suivi/followRemovePPAPatient'); followRemovePPAPatientSelect.execute(interaction, errEmb); }
            if(cID == 'followUpdateSecoursFormaSelect') { const followUpdateSecoursFormaSelect = require('../buttons/suivi/followUpdateSecoursForma'); followUpdateSecoursFormaSelect.execute(interaction, errEmb); }
            if(cID == 'followUpdateSecoursFormaSelectCat') { const followUpdateSecoursFormaSelectCat = require('../buttons/suivi/followUpdateSecoursForma'); followUpdateSecoursFormaSelectCat.execute(interaction, errEmb); }
            if(cID == 'followUpdateSecoursPatientSelect') { const followUpdateSecoursPatientSelect = require('../buttons/suivi/followUpdateSecoursPatient'); followUpdateSecoursPatientSelect.execute(interaction, errEmb); }
            if(cID == 'followRemoveSecoursFormaSelect') { const followRemoveSecoursFormaSelect = require('../buttons/suivi/followRemoveSecoursForma'); followRemoveSecoursFormaSelect.execute(interaction, errEmb); }
            if(cID == 'followRemoveSecoursPatientSelect') { const followRemoveSecoursPatientSelect = require('../buttons/suivi/followRemoveSecoursPatient'); followRemoveSecoursPatientSelect.execute(interaction, errEmb); }
            if(cID == 'companyDeleteSelect') { const companyDeleteSelect = require('../commands/private/inspection'); companyDeleteSelect.execute(interaction, errEmb); }
            if(cID == 'featureDeleteSelect') { const featureDeleteSelect = require('../commands/private/feature'); featureDeleteSelect.execute(interaction, errEmb); }
            if(cID == 'featureUpdateSelect') { const featureUpdateSelect = require('../commands/private/feature'); featureUpdateSelect.execute(interaction, errEmb); }
            if(cID == 'addFeaturePatchnoteSelect') { const addFeaturePatchnoteSelect = require('../commands/private/patchnote'); addFeaturePatchnoteSelect.execute(interaction, errEmb); }
            if(cID == 'removeFeaturePatchnoteSelect') { const removeFeaturePatchnoteSelect = require('../commands/private/patchnote'); removeFeaturePatchnoteSelect.execute(interaction, errEmb); }
            //Logs de quel option du menu de selection à été utilisée
            logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`);
        }
    },
};