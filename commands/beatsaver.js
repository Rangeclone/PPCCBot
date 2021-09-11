const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton } = require('discord.js');
const request = require('request');
const songsperpage = 5;
const buttonexpire = 300000;

const difshort = {
	Easy: 'E',
	Normal: 'N',
	Hard: 'H',
	Expert: 'EX',
	ExpertPlus: 'EX+',
};

async function embedmake(interaction, data, currentpage, pages) {
	const returnembed = new MessageEmbed()
		.setTitle('Songs from BeatSaver')
		.setThumbnail('https://beatsaver.com/static/favicon/apple-touch-icon.png')
		.setURL('https://beatsaver.com/')
		.setTimestamp()
		.setDescription('Having problems installing? [Click Here](https://oneclick-redirect.000webhostapp.com/first.html?id=1188e) to enable them.')
		.setAuthor('Page ' + String(currentpage) + '/' + String(pages))
		.setFooter('This prompt will deactivate in ' + Math.floor(buttonexpire / 1000) + ' seconds');
	for (const pos in data) {
		const songdata = data[pos];
		const currentversion = songdata.versions[songdata.versions.length - 1];
		let difstring = '';
		for (const difpos in currentversion.diffs) {
			const selecteddif = currentversion.diffs[difpos];
			const append = difshort[selecteddif.difficulty];
			difstring = difstring + append + ' ';
		}
		let songname = '';
		if (songdata.automapper == false) {
			songname = songdata.name;
		}
		else {
			songname = songdata.name + '[AUTO GENERATED]';
		}
		returnembed.addField(`${songname}`, `Mapper: [${songdata.uploader.name}](https://beatsaver.com/profile/${songdata.uploader.id}) \nDifficulties: ${difstring} \nDownloads: ${songdata.stats.downloads} \nRating: ${String(songdata.stats.score * 100)}% \n[Install](https://oneclick-redirect.000webhostapp.com/?id=${songdata.id}) | [Download](${currentversion.downloadURL}) | [Site](https://beatsaver.com/maps/${songdata.id})`, false);
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
					let currentpage = 1;
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
					let SaverEmbed = await embedmake(interaction, dataarray[index(currentpage, false)], currentpage, pages);
					const row2 = new MessageActionRow()
						.addComponents(
							new MessageButton()
								.setCustomId('previous')
								.setLabel('<')
								.setStyle('PRIMARY'),
						)
						.addComponents(
							new MessageButton()
								.setCustomId('next')
								.setLabel('>')
								.setStyle('PRIMARY'),
						);
					await interaction.channel.send({ embeds: [SaverEmbed], components: [row2] });
					const filter2 = z => z.customId === 'primary' && z.user.id === interaction.user.id;

					const collector2 = interaction.channel.createMessageComponentCollector({ filter2, time: buttonexpire });
					let pagechanged = false;
					let newpage;
					collector2.on('collect', async z => {
						if (z.customId === 'previous') {
							pagechanged = true;
							newpage = currentpage - 1;
							if (newpage < 1) newpage = pages;
						}
						if (z.customId === 'next') {
							pagechanged = true;
							newpage = currentpage + 1;
							if (newpage > pages) newpage = 1;
						}
						if (pagechanged == true) {
							pagechanged = false;
							currentpage = newpage;
							SaverEmbed = await embedmake(interaction, dataarray[index(currentpage, false)], currentpage, pages);
							z.update({ embeds: [SaverEmbed], components: [row2] });
						}
					});

					collector2.on('end', collected => console.log(`Collected ${collected.size} items`));
				});
			}
		});
		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
	},
};