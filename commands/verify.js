const { SlashCommandBuilder } = require('@discordjs/builders');

const { verifyaccount } = require('../rbxaccounthandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Links your discord to your roblox account.')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Roblox Username')
				.setRequired(true)),
	async execute(client, interaction) {
		const username = interaction.options.get('username').value;
		verifyaccount(interaction.member.id,interaction,username)
	},
};