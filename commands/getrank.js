const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require('request');
const noblox = require('noblox.js');
const { changeaccount } = require('../rbxaccounthandler.js');

function userstringtouser(interaction, string) {
	if (!string) return null;
	string = string.replace('<@!', '');
	string = string.replace('>', '');
	return interaction.guild.members.cache.get(string);
}


module.exports = {
	permissions: {
		roles: ['Bot Perms'],
		users: [216703533460881409],
	},
	data: new SlashCommandBuilder()
		.setName('getrank')
		.setDescription('Gets the rank of a ROBLOX user.')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Roblox Username')
				.setRequired(true)),
	async execute(client, interaction) {

		changeaccount(interaction.guild.id).then((response) => {
			if (response == null) return interaction.reply({ content: 'Error: This guild has not been assigned a group/token.', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
			if (response.success == false) return interaction.reply({ content: `Failed to login to roblox account: \`\`\`${response.error}\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
			let username = interaction.options.get('username').value;
			const member = userstringtouser(interaction, username);
			if (member) {username = member.nickname || member.user.username;}
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
				if (!req) return interaction.reply({ content: 'Oops! We are currently have a problem communicating with roblox. <http://status.roblox.com/>', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				const req2 = JSON.parse(rbxresponse.body);
				if (req2.success === false) return interaction.reply({ content: 'Failed to find ROBLOX user, did you enter the correct username?', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				noblox.getRankInGroup(response.group, Number(req2.Id)).then((rankid) => {
					if (rankid) {
						noblox.getRankNameInGroup(response.group, Number(req2.Id)).then((rankname) => {
							if (rankname) {
								interaction.reply({ content: `${username}'s rank: \`${rankname}\` \`${rankid}\``, components: [] });
							}
							else {
								throw 'Did not recieve expected response from API.';
							}
						});
					}
					else {
						throw 'Did not recieve expected response from API.';
					}
				}).catch(function(e) {
					return interaction.reply({ content: `Failed to find \`${username}'s\` rank. \`\`\`${e}\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				});
			});
		});
	},
};