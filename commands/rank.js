/* eslint-disable max-nested-callbacks */
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
			if (response == null) return interaction.reply({ content: 'Error: This guild has not been assigned a group/token.', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
			if (response.success == false) return interaction.reply({ content: `Failed to login to roblox account: \`\`\`${response.error}\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
			const rank = interaction.options.get('rank').value;
			let username = interaction.options.get('username').value;
			const speakername = interaction.member.nickname || interaction.member.user.username;
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
			const options2 = {
				url: 'https://api.roblox.com/users/get-by-username?username=' + speakername,
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
				request(options2, async function(error2, rbxresponse2) {
					const req21 = rbxresponse2.body;
					if (!req21) return interaction.reply({ content: 'Oops! We are currently have a problem communicating with roblox. <http://status.roblox.com/>', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
					const req22 = JSON.parse(rbxresponse2.body);
					if (req22.success === false) return interaction.reply({ content: 'Failed to your ROBLOX user, is your server nickname the same as your ROBLOX name?', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
					const speakerrank = await noblox.getRankInGroup(response.group, Number(req22.Id));
					const targetrank = await noblox.getRankInGroup(response.group, Number(req2.Id));
					if (speakerrank === targetrank || speakerrank < targetrank) return interaction.reply({ content: `Failed to change \`${username}'s\` rank to \`${rank}\` \`\`\`Error: 403-B You do not have permission to manage this member.\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
					noblox.getRoles(response.group).then((res44) => {
						let roleid = null;
						const searching = rank;
						for (const i in res44) {
							if (res44[i].name === searching) {
								roleid = res44[i].rank;
							}
						}
						// eslint-disable-next-line max-nested-callbacks
						if (roleid == null) return interaction.reply({ content: 'Failed to find ROBLOX rank, did you enter the correct rank name?', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
						if (speakerrank === Number(roleid) || speakerrank < Number(roleid)) return interaction.reply({ content: `Failed to change \`${username}'s\` rank to \`${rank}\` \`\`\`Error:  You do not have permission to assign this role.\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
						// eslint-disable-next-line max-nested-callbacks
						noblox.setRank({ group: response.group, target: Number(req2.Id), rank: Number(roleid) }).then((nobloxres) => {
							if (nobloxres) {
								interaction.reply({ content: 'Successfully changed `' + username + '\'s` rank to `' + rank + '`', components: [] });
							}
							else {
								throw 'Did not recieve expected response from API.';
							}
						// eslint-disable-next-line max-nested-callbacks
						}).catch(function(e) {
							// eslint-disable-next-line max-nested-callbacks
							return interaction.reply({ content: `Failed to change \`${username}'s\` rank to \`${rank}\` \`\`\`${e}\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
						});
					});
				});
			});
		});
	},
};