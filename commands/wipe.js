const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const { changeaccount,testcookie } = require('../rbxaccounthandler.js');
const fs = require("fs");


module.exports = {
	permissions: {
		roles: ['Bot Perms'],
		users: [216703533460881409],
	},
	data: new SlashCommandBuilder()
		.setName('wipe')
		.setDescription('Wipes a guilds configuration.'),
	async execute(client, interaction) {
		const serverfiles = fs.readdirSync("./servers").filter((file) => file.endsWith(".json"));
		const groupid = interaction.options.get('groupid').value;
		const token = interaction.options.get('token').value;
		const guildid = interaction.guild.id
		var file
		for (var index in serverfiles) {
			if(serverfiles[index] === String(guildid) + '.json') {
				file = serverfiles[index]
				break
			}
		}
		if (!file) return interaction.reply({ content: 'Error: No configuration file found for this guild.', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
	},
};