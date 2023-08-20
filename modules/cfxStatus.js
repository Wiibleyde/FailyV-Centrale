const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cfx = require('cfx-api');
const logger = require('./logger');
const emb = require('./embeds');
const sql = require('../sql/config/config');

let games = '';
let fiveM = '';
let cfxPlatformServer = '';
let gameServices = '';
let cnl = '';
let policy = '';
let webServices = '';
let serverListFrontend = '';
let runtime = '';
let idms = '';

let degradedPerformance = 0;
let partialOutage = 0;
let majorOutage = 0;
let underMaintenance = 0;

let color = '#0DE600';

let mainComponentChanged = false;

const wait = require('node:timers/promises').setTimeout;

const btn = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel(`Être/Ne plus être notifié lors d'un problème sur les services Cfx.re`).setCustomId('cfxNotif').setStyle(ButtonStyle.Danger).setEmoji('713707511332470785').setDisabled(false),
);

module.exports = {
    startStatusCheck: async (client) => {
        const cfxThreadId = await sql.getChannel('cfx_thread');
        let cfxStatusMessageId = await sql.getMessage('cfx_status');
        let cfxThread = null;
        let cfxStatusMessage = null;
        if(cfxThreadId[0] != null && cfxStatusMessageId[0] != null) {
            try {
                cfxThread = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(cfxThreadId[0].id);
                cfxStatusMessage = await cfxThread.messages.fetch(cfxStatusMessageId[0].id);
            } catch (err) {}
        }
        if(cfxStatusMessage != null) {
            const datas = cfxStatusMessage.embeds[0].description.split('- `');
            for(let i=1;i<datas.length;i++) {
                const data = datas[i];
                const parsedData = data.split('` ');
                const icon = parsedData[0];
                const component = parsedData[1];
                switch(component) {
                    case 'Games\n  ':
                        games = getState(icon);
                        break;
                    case 'FiveM\n  ':
                        fiveM = getState(icon);
                        break;
                    case 'Cfx.re Platform Server (FXServer)\n':
                        cfxPlatformServer = getState(icon);
                        break;
                    case 'Game Services\n  ':
                        gameServices = getState(icon);
                        break;
                    case 'CnL\n  ':
                        cnl = getState(icon);
                        break;
                    case 'Policy\n  ':
                        policy = getState(icon);
                        break;
                    case 'Web Services\n  ':
                        webServices = getState(icon);
                        break;
                    case 'Server List Frontend\n  ':
                        serverListFrontend = getState(icon);
                        break;
                    case '"Runtime"\n  ':
                        runtime = getState(icon);
                        break;
                    case 'IDMS':
                        idms = getState(icon);
                        break;
                    default:
                        continue;
                }
                switch(getState(icon)) {
                    case 'degraded_performance':
                        degradedPerformance++;
                        break;
                    case 'partial_outage':
                        partialOutage++;
                        break;
                    case 'major_outage':
                        majorOutage++;
                        break;
                    case 'under_maintenance':
                        underMaintenance++;
                        break;
                    default:
                        break;
                }
            }
            color = cfxStatusMessage.embeds[0].color;
        }
        setInterval(async () => {
            let hasChanged = false;
            degradedPerformance = 0;
            partialOutage = 0;
            majorOutage = 0;
            underMaintenance = 0;
            color = '#0DE600';
            mainComponentChanged = false;
            const status = await cfx.fetchStatus();
            const components = await status.fetchComponents();
            for(let component of components) {
                switch(component.name) {
                    case 'Games':
                        if(games != component.status) { hasChanged = true; }
                        games = component.status;
                        break;
                    case 'FiveM':
                        if(fiveM != component.status) { hasChanged = true; mainComponentChanged = true; }
                        fiveM = component.status;
                        break;
                    case 'RedM':
                        break;
                    case 'Cfx.re Platform Server (FXServer)':
                        if(cfxPlatformServer != component.status) { hasChanged = true; mainComponentChanged = true; }
                        cfxPlatformServer = component.status;
                        break;
                    case 'Game Services':
                        if(gameServices != component.status) { hasChanged = true; }
                        gameServices = component.status;
                        break;
                    case 'CnL':
                        if(cnl != component.status) { hasChanged = true; mainComponentChanged = true; }
                        cnl = component.status;
                        break;
                    case 'Policy':
                        if(policy != component.status) { hasChanged = true; mainComponentChanged = true; }
                        policy = component.status;
                        break;
                    case 'Keymaster':
                        break;
                    case 'Web Services':
                        if(webServices != component.status) { hasChanged = true; }
                        webServices = component.status;
                        break;
                    case 'Forums':
                        break;
                    case 'Server List Frontend':
                        if(serverListFrontend != component.status) { hasChanged = true; mainComponentChanged = true; }
                        serverListFrontend = component.status;
                        break;
                    case '"Runtime"':
                        if(runtime != component.status) { hasChanged = true; mainComponentChanged = true; }
                        runtime = component.status;
                        break;
                    case 'IDMS':
                        if(idms != component.status) { hasChanged = true; mainComponentChanged = true; }
                        idms = component.status;
                        break;
                    default:
                        break;
                }
                switch(component.status) {
                    case 'degraded_performance':
                        degradedPerformance++;
                        break;
                    case 'partial_outage':
                        partialOutage++;
                        break;
                    case 'major_outage':
                        majorOutage++;
                        break;
                    case 'under_maintenance':
                        underMaintenance++;
                        break;
                    default:
                        break;
                }
            }
            if(degradedPerformance >= 1) { color = '#F1C40F'; }
            if(partialOutage >= 1) { color = '#E67E22'; }
            if(underMaintenance >= 1) { color = '#3498DB'; }
            if(majorOutage >= 1) { color = '#E74C3C'; }
            cfxStatusMessageId = await sql.getMessage('cfx_status');
            if(cfxThreadId[0] != null) {
                try {
                    cfxStatusMessage = await cfxThread.messages.fetch(cfxStatusMessageId[0].id);
                    if(hasChanged) { updateStatus(cfxStatusMessage, cfxThread); }
                } catch (err) {}
            }
        }, 30000);
    },
    sendStatusEmbed: (client, channel) => {
        new Promise(async (resolve, reject) => {
            const newMsg = await channel.send({ embeds: [emb.generate(null, null, `- \`${getIcon(games)}\` Games\n  - \`${getIcon(fiveM)}\` FiveM\n  - \`${getIcon(cfxPlatformServer)}\` Cfx.re Platform Server (FXServer)\n- \`${getIcon(gameServices)}\` Game Services\n  - \`${getIcon(cnl)}\` CnL\n  - \`${getIcon(policy)}\` Policy\n- \`${getIcon(webServices)}\` Web Services\n  - \`${getIcon(serverListFrontend)}\` Server List Frontend\n  - \`${getIcon(runtime)}\` "Runtime"\n  - \`${getIcon(idms)}\` IDMS`, color, `https://cdn.discordapp.com/attachments/1132323171471736915/1142205778745376858/cfx.png`, null, `Cfx.re Status`, null, `https://status.cfx.re/`, client.user.username, client.user.avatarURL(), true)], components: [btn] });
            await sql.deleteMessage('cfx_status');
            await sql.setMessage('cfx_status', newMsg.id);
            resolve('Done!');
        });
    }
}

async function updateStatus(cfxStatusMessage, cfxThread) {
    const cfxStatusMessageOld = cfxStatusMessage;
    let oldColor = cfxStatusMessageOld.embeds[0].color.toString(16).toUpperCase();
    if(oldColor.length == 5) {
        oldColor = '0' + oldColor;
    }
    oldColor = '#' + oldColor;
    await cfxStatusMessage.edit({ embeds: [emb.generate(null, null, `- \`${getIcon(games)}\` Games\n  - \`${getIcon(fiveM)}\` FiveM\n  - \`${getIcon(cfxPlatformServer)}\` Cfx.re Platform Server (FXServer)\n- \`${getIcon(gameServices)}\` Game Services\n  - \`${getIcon(cnl)}\` CnL\n  - \`${getIcon(policy)}\` Policy\n- \`${getIcon(webServices)}\` Web Services\n  - \`${getIcon(serverListFrontend)}\` Server List Frontend\n  - \`${getIcon(runtime)}\` "Runtime"\n  - \`${getIcon(idms)}\` IDMS`, color, `https://cdn.discordapp.com/attachments/1132323171471736915/1142205778745376858/cfx.png`, null, `Cfx.re Status`, null, `https://status.cfx.re/`, cfxStatusMessage.embeds[0].footer.text, cfxStatusMessage.embeds[0].footer.icon_url, true)], components: [btn] });
    if(mainComponentChanged) {    if(oldColor != color) {
        logger.debug(oldColor);
        logger.debug(color);
        let state;
        if(oldColor == `#0DE600`) /*Operational*/ {
            if(color == `#F1C40F`) /*Degraded performance*/ { state = `Un/des composant·s a/ont des performances dégradées, il n'est pas impossible que vous ayez des complications pour vous connecter !`; }
            if(color == `#E67E22`) /*Partial Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s viens/viennent de tomber en panne partielle !`; }
            if(color == `#3498DB`) /*Under Maintenance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s est/sont désormais en maintenance !`; }
            if(color == `#E74C3C`) /*Major Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s viens/viennent de tomber en panne majeure !`; }
        }
        if(oldColor == `#F1C40F`) /*Degraded performance*/ {
            if(color == `#0DE600`) /*Operational*/ { state = `Tout les composants sont revenus à la normal est sont de nouveau complètement opérationnels !`; }
            if(color == `#E67E22`) /*Partial Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s viens/viennent de tomber en panne partielle !`; }
            if(color == `#3498DB`) /*Under Maintenance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s est/sont désormais en maintenance !`; }
            if(color == `#E74C3C`) /*Major Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s viens/viennent de tomber en panne majeure !`; }
        }
        if(oldColor == `#E67E22`) /*Partial Outage*/ {
            if(color == `#0DE600`) /*Operational*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants sont de nouveau opérationnels !`; }
            if(color == `#F1C40F`) /*Degraded performance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants ont été redémarrés mais ne sont pas totalement stables, il n'est pas impossible que vous ayez encore un peut de mal pour vous connecter !`; }
            if(color == `#3498DB`) /*Under Maintenance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s est/sont désormais en maintenance !`; }
            if(color == `#E74C3C`) /*Major Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s viens/viennent de tomber en panne majeure !`; }
        }
        if(oldColor == `#3498DB`) /*Under Maintenance*/ {
            if(color == `#0DE600`) /*Operational*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants sont de nouveau opérationnels !`; }
            if(color == `#F1C40F`) /*Degraded performance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants ont été redémarrés mais ne sont pas totalement stables, il n'est pas impossible que vous ayez encore un peut de mal pour vous connecter !`;}
            if(color == `#E67E22`) /*Partial Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants ne sont plus en maintenance mais il y a toujours une panne partielle sur certains composants !`; }
            if(color == `#E74C3C`) /*Major Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s viens/viennent de tomber en panne majeure !`; }
        }
        if(oldColor == `#E74C3C`) /*Major Outage*/ {
            if(color == `#0DE600`) /*Operational*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants sont de nouveau opérationnels !`; }
            if(color == `#F1C40F`) /*Degraded performance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants ont été redémarrés mais ne sont pas totalement stables, il n'est pas impossible que vous ayez encore un peut de mal pour vous connecter !`;}
            if(color == `#E67E22`) /*Partial Outage*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> tout les composants ne sont plus en panne majeure mais il en reste encore qui sont en panne partielle !`;}
            if(color == `#3498DB`) /*Under Maintenance*/ { state = `<@&${process.env.IRIS_CFX_ROLE}> un/des composant·s est/sont désormais en maintenance !`; }
        }
        const msg = await cfxThread.send({ content: `${state}` });
        await wait(120000);
        try {
            msg.delete();
        } catch (err) {}
    }
    }
}

function getIcon(state) {
    switch(state) {
        case 'degraded_performance':
            return '🟡';
        case 'partial_outage':
            return '🟠';
        case 'major_outage':
            return '🔴';
        case 'under_maintenance':
            return '🔵';
        default:
            return '🟢';
    }
}

function getState(icon) {
    switch(icon) {
        case '🟡':
            return 'degraded_performance';
        case '🟠':
            return 'partial_outage';
        case '🔴':
            return 'major_outage';
        case '🔵':
            return 'under_maintenance';
        default:
            return 'operational';
    }
}