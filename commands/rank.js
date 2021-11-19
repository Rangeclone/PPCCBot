const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require('request');
const noblox = require('noblox.js');
const { changeaccount } = require('../rbxaccounthandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Changes the rank of a ROBLOX user.')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Roblox Username')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('rank')
				.setDescription('Name of the rank')
				.setRequired(true)),
	async execute(client, interaction) {

		changeaccount(interaction.guild.id).then((response) => {
			if (response == null) return interaction.reply({ content: 'Error: This guild has not been assigned a group/token.', components: [] });
			if (response.success == false) return interaction.reply({ content: `Failed to login to roblox account: \`\`\`${response.error}\`\`\``, components: [] });
			const username = interaction.options.get('username').value;
			const rank = interaction.options.get('rank').value;
			const options = {
				url: 'https://api.roblox.com/users/get-by-username?username=' + username,
				method: 'GET',
				headers: {
					'Accept': 'text/html',
					'User-Agent': 'Chrome',
				},
			};

			request(options, async function(error, rbxresponse) {
				const req = rbxresponse.body;
				if (!req) return interaction.reply({ content: 'Oops! We are currently have a problem communicating with roblox. <http://status.roblox.com/>', components: [] });
				const req2 = JSON.parse(rbxresponse.body);
				if (req2.success === false) return interaction.reply({ content: 'Failed to find ROBLOX user, did you enter the correct username?', components: [] });
				noblox.getRoles(response.group).then((res44) => {
					let roleid = null;
					const searching = rank;
					for (const i in res44) {
						if (res44[i].name === searching) {
							roleid = res44[i].rank;
						}
					}
					if (roleid == null) return interaction.reply({ content: 'Failed to find ROBLOX rank, did you enter the correct rank name?', components: [] });
					noblox.setRank({ group: response.group, target: Number(req2.Id), rank: Number(roleid) }).then((nobloxres) => {
						if (nobloxres) {
							interaction.reply({ content: 'Successfully changed `' + username + '\'s` rank to `' + rank + '`', components: [] });
						}
						else {
							throw 'Did not recieve expected response from API.';
						}
					}).catch(function(e) {
						return interaction.reply({ content: `Failed to change \`${username}'s\` rank to \`${rank}\` \`\`\`${e}\`\`\``, components: [] });
					});
				});
			});
		});
	},
};