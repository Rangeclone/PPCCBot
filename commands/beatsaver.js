const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const request = require('request');
const songsperpage = 5;

function embedmake(interaction, data, currentpage, pages) {
	const returnembed = new MessageEmbed()
		.setTitle('Songs from BeatSaver')
		.setThumbnail('https://beatsaver.com/static/favicon/apple-touch-icon.png')
		.setTimestamp()
		.setFooter('Page ' + String(currentpage) + '/' + String(pages));
	return returnembed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beatsaver')
		.setDescription('Displays a list of uploaded songs.'),
	async execute(client, interaction) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'First Published',
							description: 'First Published songs',
							value: 'FIRST_PUBLISHED',
						},
						{
							label: 'Updated',
							description: 'Updated songs',
							value: 'UPDATED',
						},
						{
							label: 'Last Published',
							description: 'Last Published songs',
							value: 'LAST_PUBLISHED',
						},
						{
							label: 'Created',
							description: 'Created songs',
							value: 'CREATED',
						},
					]),
			);
		await interaction.reply({ content: 'Please select what to sort by.', components: [row] });
		let selected = false;
		const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
		collector.on('collect', async i => {
			if (i.customId === 'select' && selected == false) {
				selected = true;
				await interaction.editReply({ content: 'Contacting the BeatSaver API....', components: [] });
				const options = {
					url: 'https://api.beatsaver.com/maps/latest?sort=' + String(i.values[0]) || 'UPDATED',
					method: 'GET',
					headers: {
						'Accept': 'application/json',
					},
				};
				request(options, async function(error, response) {
					interaction.deleteReply();
					if (!response) return interaction.followUp({ content: 'There was an error contacting the BeatSaver API.', components: [] });
					if (!response.body) return interaction.followUp({ content: 'There was an error contacting the BeatSaver API.', components: [] });
					const data = JSON.parse(response.body);
					console.log(data);
					const songarray = data.docs;
					const pages = Math.floor(songarray.length / songsperpage);
					const currentpage = 1;
					console.log(pages);
					const SaverEmbed = await embedmake(interaction, data, currentpage, pages);
					console.log(songarray[0]);
					interaction.channel.send({ embeds: [SaverEmbed] });
				});
			}
		});
		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
	},
};