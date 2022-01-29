const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const { changeaccount,testcookie,getgroupinfo } = require('../rbxaccounthandler.js');
const fs = require("fs");

function callbackFunction(e){

}

module.exports = {
	permissions: {
		roles: ['Bot Perms'],
		users: [216703533460881409],
	},
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Links discord guild to a group.')
		.addStringOption(option =>
			option.setName('groupid')
				.setDescription('The roblox group ID.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('token')
				.setDescription('Your groups bot account, .ROBLOSECURITY token.')
				.setRequired(true)),
	async execute(client, interaction) {
		const serverfiles = fs.readdirSync("./servers").filter((file) => file.endsWith(".json"));
		const groupid = interaction.options.get('groupid').value;
		const token = interaction.options.get('token').value;
		const guildid = interaction.guild.id
		const guildname = interaction.guild.name
		for (var index in serverfiles) {
			if(serverfiles[index] === String(guildid) + '.json') return interaction.reply({ content: 'Error: This guild has already been configured, run `/wipe` to delete the current configuration.', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
		}
		getgroupinfo(groupid).then((response) => {
			if(response.success === false) return interaction.reply({ content: 'Failed to find group: ```' + response.error + '```', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
			const groupname = response.group.name
			testcookie(token).then((response) => {
				if(response.success === false) return interaction.reply({ content: 'RBX Account Token Error: ```' + response.error + '```', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				const write = {
					GuildID: guildid,
					GroupID: groupid,
					GroupName: groupname,
					GuildName: guildname,
					Token: token,
					AccountName: response.user.UserName,
					AccountID: response.user.UserID
				}
				try {
					const raw = JSON.stringify(write, null, 2);
					fs.writeFile('./servers/' + String(guildid) + '.json',raw, callbackFunction)
					var str = ''
					for (var index2 in write) {
						if (index2 !== "Token") {
							str = str + index2 + ': ' + write[index2] + '\n'
						}
					}
					return interaction.reply({ content: 'Sucessfuly setup guild: ```' + str + '```', components: [] })
				}
				catch (error) {
					console.error(error);
					return interaction.reply({ content: 'Error creating file: ```' + error + '```', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				}
			})
		})
	},
};