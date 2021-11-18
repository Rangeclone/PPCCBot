const { SlashCommandBuilder } = require('@discordjs/builders');

const { changeaccount } = require('../rbxaccounthandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Changes the rank of a ROBLOX user.'),
	async execute(client, interaction) {
		changeaccount(interaction.guild.id).then((currentUser) => {
			console.log(currentUser);
			if (!currentUser) return interaction.followUp({ content: 'Error: This guild has not been assigned a group/token.', components: [] });
		});
	},
};