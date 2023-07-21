//Récup du logger
const logger = require('./../modules/logger');
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if(message.channelId == process.env.IRIS_SERVICE_CHANNEL_ID || message.channelId == process.env.IRIS_RADIO_CHANNEL_ID) {
            if(message.author != process.env.IRIS_DISCORD_ID) {
                logger.debug(message);
                logger.log(`${message.author.username}#${message.author.discriminator} (<@${message.author.id}>) à envoyé un message dans un salon interdit (${message.content})`);
                await message.delete();
            }
        }
    }
};