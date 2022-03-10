const { SlashCommandBuilder } = require('@discordjs/builders');
const { verifyaccount } = require('../rbxaccounthandler.js');
module.exports = {
	permissions: {
		users: [216703533460881409],
	},
	data: new SlashCommandBuilder()
		.setName('execute')
		.setDescription('Executes provided code.')
		.addStringOption(option =>
			option.setName('loadsring')
				.setDescription('Code to execute')
				.setRequired(true)),
	async execute(client, interaction) {
		const loadsring = interaction.options.get('loadsring').value;
		eval(loadsring);
		return interaction.reply({ content: 'Executed loadstring', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
	},
};