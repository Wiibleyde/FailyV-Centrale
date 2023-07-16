//Récup du créateur d'embed
const emb = require('./../modules/embeds');

module.exports = {
    pds: (guild, nickname, forcer) => {
        let content;
        const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_LOGS_ID);
        if(forcer != null) {
            content = `Prise de service (par ${forcer})`;
        } else {
            content = `Prise de service`;
        }
        chan.send({ embeds: [emb.generate(null, null, `${nickname}`, `#0DE600`, process.env.LSMS_LOGO_V2, null, content, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)] });
    },
    fds: (guild, nickname, forcer) => {
        let content;
        const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_LOGS_ID);
        if(forcer != null) {
            content = `Fin de service (par ${forcer})`;
        } else {
            content = `Fin de service`;
        }
        chan.send({ embeds: [emb.generate(null, null, `${nickname}`, `#FF0000`, process.env.LSMS_LOGO_V2, null, content, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)] });
    },
    pdd: (guild, nickname, forcer) => {
        let content;
        const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_LOGS_ID);
        if(forcer != null) {
            content = `Prise de dispatch (par ${forcer})`;
        } else {
            content = `Prise de dispatch`;
        }
        chan.send({ embeds: [emb.generate(null, null, `${nickname}`, `#FFF1D0`, process.env.LSMS_LOGO_V2, null, content, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)] });
    },
    fdd: (guild, nickname, forcer) => {
        let content;
        const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_LOGS_ID);
        if(forcer != null) {
            content = `Dispatch relaché (par ${forcer})`;
        } else {
            content = `Dispatch relaché`;
        }
        chan.send({ embeds: [emb.generate(null, null, `${nickname}`, `#FFF1D0`, process.env.LSMS_LOGO_V2, null, content, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)] });
    }
}