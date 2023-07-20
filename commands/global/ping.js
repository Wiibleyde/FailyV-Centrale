//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        let status;
			switch (true) {
				case (interaction.client.ws.ping < 50):
					status = "Très bon";
					break;
				case (interaction.client.ws.ping < 100):
					status = "Bon";
					break;
				case (interaction.client.ws.ping < 150):
					status = "Correct";
					break;
				case (interaction.client.ws.ping < 200):
					status = "Faible";
					break;
				case (interaction.client.ws.ping < 500):
					status = "Mauvais";
					break;
				default:
					status = "Très mauvais";
			}

			const formatM = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`
			const memoryData = process.memoryUsage()

			let pingEmbed = emb.generate(null,null,`🏓 **Pong !**\n- **Ping :** ${interaction.client.ws.ping} ms (${status})\n- **Latence :** ${Date.now() - interaction.createdTimestamp}ms\n- **Mémoire :** ${formatM(memoryData.heapUsed)}\n- **En ligne depuis :** <t:${(new Date() / 1000 - interaction.client.uptime / 1000).toFixed()}:R>`, `Gold`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
			return interaction.reply({ embeds: [pingEmbed], ephemeral: true });
		}
};