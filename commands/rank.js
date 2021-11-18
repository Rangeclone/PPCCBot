const { SlashCommandBuilder } = require('@discordjs/builders');

const { changeaccount } = require('../rbxaccounthandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Changes the rank of a ROBLOX user.'),
	async execute(client, interaction) {
		changeaccount(interaction.guild.id).then((response) => {
			console.log(response);
			if (response == null) return interaction.reply({ content: 'Error: This guild has not been assigned a group/token.', components: [] });
			if (response.success == false) return interaction.reply({ content: `Failed to login to roblox account: \`\`\`${response.error}\`\`\``, components: [] });
		});
	},
};