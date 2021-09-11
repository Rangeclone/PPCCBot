const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const request = require('request');
const songsperpage = 5;

async function embedmake(interaction, data, currentpage, pages) {
	const returnembed = new MessageEmbed()
		.setTitle('Songs from BeatSaver')
		.setThumbnail('https://beatsaver.com/static/favicon/apple-touch-icon.png')
		.setURL('https://beatsaver.com/')
		.setTimestamp()
		.setDescription('Page ' + String(currentpage) + '/' + String(pages));
	for (const pos in data) {
		console.log(pos);
	}
	return returnembed;
}

function index(p, c) {
	if (c == true) return p + 1;
	if (c == false) return p - 1;
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
					const songarray = data.docs;
					const pages = Math.floor(songarray.length / songsperpage);
					const currentpage = 1;
					let currentarray = 0;
					let currentdataindex = 0;
					const dataarray = {};
					for (const pos in songarray) {
						if (currentarray > pages) break;
						const selectedsong = songarray[pos];
						if (!dataarray[currentarray]) {dataarray[currentarray] = [];}
						const selectedarray = dataarray[currentarray];
						selectedarray.push(selectedsong);
						currentdataindex = currentdataindex + 1;
						if (index(currentdataindex, true) > songsperpage) {
							currentarray = currentarray + 1;
							currentdataindex = 0;
						}
					}
					console.log(dataarray);
					const SaverEmbed = await embedmake(interaction, dataarray[index(currentpage, false)], currentpage, pages);
					interaction.channel.send({ embeds: [SaverEmbed] });
				});
			}
		});
		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
	},
};