const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('beatsaver')
		.setDescription('Displays a list of uploaded songs.'),
	async execute(interaction) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Latest',
							description: 'Latest songs',
							value: 'first_option',
						},
						{
							label: 'Rating',
							description: 'Best rated songs',
							value: 'second_option',
						},
					]),
			);
		await interaction.reply({ content: 'Please select what to sort by.', components: [row] });
		const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
		collector.on('collect', async i => {
			if (i.customId === 'select') {
				await i.deferUpdate();
				await i.editReply({ content: 'A menu was selected!', components: [] });
			}
		});

		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
	},
};