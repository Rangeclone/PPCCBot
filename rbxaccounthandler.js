const noblox = require('noblox.js');
const config = require('./config.json');
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton } = require('discord.js');
var fs = require("fs");
var redirect = module.exports
const serverfiles = fs.readdirSync("./servers").filter((file) => file.endsWith(".json"));
const userfiles = fs.readdirSync("./verifiedusers").filter((file) => file.endsWith(".json"));
const request = require('request-promise');

let user = ['', 0, {}];
const verifytext = ['ball','cookie','apple','adventure','bread','oof','car','chicken','golf','and','the','amber','red','green','orange','blue','story','life','time','baby','toys','race','clap','human','sad','angry','happy','lonely','sound','smell','look']
const buttonexpire = 300000;

function getUserFromMention(mention, interaction) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return interaction.guild.members.cache.get(mention);
	}
}

module.exports = {
	async getgroupinfo(id) {
		const options = {
			url: 'https://groups.roblox.com/v2/groups?groupIds=' + id,
			method: 'GET',
			headers: {
				'Accept': 'text/html',
				'User-Agent': 'Chrome',
			},
		};
		return request(options).then((response) => {
			const parsedresponse = JSON.parse(response);
			if (parsedresponse.data.length < 1) return { success: false, error: 'Roblox Group not found!' };
			return { success: true, group: parsedresponse.data[0] };
		})
			.catch(function(err) {
				return { success: false, error: 'Roblox API error:' + err };
			});
	},
	async verifyaccount(id,interaction,username){
		if(userfiles.find(name => name = String(id)+'.json')) {
			const buttonrow2 = new MessageActionRow()
				  .addComponents(
					  new MessageButton()
						  .setCustomId('update')
						  .setLabel('Update Roles/Nickname')
						  .setStyle('PRIMARY'),
				  )
				  .addComponents(
					  new MessageButton()
						  .setCustomId('re')
						  .setLabel('Reverify')
						  .setStyle('DANGER'),
				  );
			//redirect.updateroles(id,interaction,String(id)+'.json')
			interaction.reply({ content: 'Account already verified, what would you like to do?', components: [buttonrow2] })
			const filter2 = z => (z.customId === 'update' || z.customId === 're') && z.user.id === interaction.user.id;
		} else {
			redirect.changeaccount(interaction.guild.id).then((response) => {
				if (response == null) return interaction.reply({ content: 'Error: This guild has not been assigned a group/token.', components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				if (response.success == false) return interaction.reply({ content: `Failed to login to roblox account: \`\`\`${response.error}\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
				redirect.getrobloxid(username, interaction).then((moduleresponse) => {
					if (moduleresponse.success === false) return interaction.reply({ content: `Failed to find ROBLOX account \`${username}\` \`\`\`${moduleresponse.error}\`\`\``, components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));

				var code = ''
				for (let i = 0; i < 10; i++) {
					let result = Math.floor((Math.random() * verifytext.length));
					if(i==9){
						code = code + verifytext[result]
					} else {
						code = code + verifytext[result] + ' '
					}
				  }
				  const buttonrow = new MessageActionRow()
				  .addComponents(
					  new MessageButton()
						  .setCustomId('done')
						  .setLabel('Done')
						  .setStyle('PRIMARY'),
				  )
				  .addComponents(
					  new MessageButton()
						  .setCustomId('cancel')
						  .setLabel('Cancel')
						  .setStyle('DANGER'),
				  );
				  const returnembed = new MessageEmbed()
					.setTitle('Account Verification Required For `'+username+'`')
					.setThumbnail('http://www.roblox.com/Thumbs/Avatar.ashx?x=420&y=420&Format=Png&userId='+String(moduleresponse.user))
					.setTimestamp()
					.setDescription('Please enter the following code into your ROBLOX account\'s about me page.')
					.addField(`**Verification Code**`, `\`${code}\``, false)
					.setFooter('This prompt will deactivate in ' + Math.floor(buttonexpire / 1000) + ' seconds');
					interaction.reply({ content: 'Account not found on our database, please complete manual verification.',  embeds: [returnembed] , components: [buttonrow],files: ["https://media.discordapp.net/attachments/936354789950910504/951581216375701514/unknown.png"], });

					const filter = z => (z.customId === 'cancel' || z.customId === 'done') && z.user.id === interaction.user.id;
					const collector = interaction.channel.createMessageComponentCollector({ filter, time: buttonexpire });
					var resolved = false
					collector.on('collect', async z => {
						if (z.customId === 'cancel') {
							return z.update({content: 'Verification cancelled', embeds: [], files: [], components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
						}
						if (z.customId === 'done') {
								let blurb = await noblox.getBlurb({userId: moduleresponse.user})
										noblox.getBlurb({userId: moduleresponse.user}).then((desc) => {
											if (desc) {
												if(desc === code){
													z.update({ content: `Code matched`, embeds: [], files: [], components: [] })
												} else {
													z.update({ content: `Code didn't match.`, embeds: [], files: [], components: [] })
												}
											}
											else {
												throw 'Did not recieve expected response from API.';
											}
								}).catch(function(e) {
									return z.update({ content: `Failed to find ${username}'s rank. \`\`\`${e}\`\`\``, files: [], components: []  }).then(setTimeout(() => interaction.deleteReply(), 10000));
								});
						}
						resolved = true
					});
					collector.on('end', collected => {
						if(resolved === false) return interaction.update({content: 'Verification timed out.', embeds: [], files: [], components: [] }).then(setTimeout(() => interaction.deleteReply(), 10000));
					});
			});
		});
		}
	},
	async updateroles(id,interaction,filename){


		this.updatenickname(id,interaction)
	},
	async updatenickname(id){

	},
	async testcookie(cookie) {
		return noblox.setCookie(cookie).then(function(res) {
			return {
				success: true,
				user: res,
			};
		}).catch(function(e) {
			return {
				success: false,
				error: e,
			};
		});
	},
	async changeaccount(guildId) {
		if (guildId) {
			if (user[0] == String(guildId)) return { success: true, user: user[2], group: user[1] };
			var serverconfig
			try {
			serverconfig = fs.readFileSync("servers/" + String(guildId) + ".json");
			  } catch (error) {
				return {
					success: false,
					error: error,
				};
			  }
			if(!serverconfig) return null
			const selectedgroup = JSON.parse(serverconfig)
			if (!selectedgroup) return null;
			return noblox.setCookie(selectedgroup.Token).then(function(res) {
				user = [guildId, selectedgroup.GroupID, res];
				return {
					success: true,
					user: res,
					group: selectedgroup.GroupID,
				};
			}).catch(function(e) {
				return {
					success: false,
					error: e,
				};
			});
		}
	},
	async getrobloxid(usern, interaction) {
		if (usern.startsWith('<@') && usern.endsWith('>')) {
			const member = getUserFromMention(usern, interaction);
			const options = {
				url: 'https://api.blox.link/v1/user/' + member.id,
				method: 'GET',
				headers: {
					'Accept': 'text/html',
					'User-Agent': 'Chrome',
				},
			};

			return request(options).then((response) => {
				const parsedresponse = JSON.parse(response);
				if (parsedresponse.status === 'error') return { success: false, error: 'Bloxlink API error: ' + parsedresponse.error };
				return { success: true, user: parsedresponse.primaryAccount };
			})
				.catch(function(err) {
					return { success: false, error: 'Bloxlink API error: ' + err };
				});
		}
		if (typeof usern == 'string') {
			const options = {
				url: 'https://api.roblox.com/users/get-by-username?username=' + usern,
				method: 'GET',
				headers: {
					'Accept': 'text/html',
					'User-Agent': 'Chrome',
				},
			};
			return request(options).then((response) => {
				const parsedresponse = JSON.parse(response);
				if (parsedresponse.success == false) return { success: false, error: 'Roblox API error: ' + parsedresponse.errorMessage };
				return { success: true, user: parsedresponse.Id };
			})
				.catch(function(err) {
					return { success: false, error: 'Roblox API error:' + err };
				});
		}
	},
};
redirect = module.exports
/* old backup
async changeaccount(guildId) {
		if (config.groups && guildId) {
			if (user[0] == String(guildId)) return { success: true, user: user[2], group: user[1] };
			const selectedgroup = config.groups[String(guildId)];
			if (!selectedgroup) return null;
			return noblox.setCookie(selectedgroup[1]).then(function(res) {
				user = [guildId, selectedgroup[0], res];
				return {
					success: true,
					user: res,
					group: selectedgroup[0],
				};
			}).catch(function(e) {
				return {
					success: false,
					error: e,
				};
			});
		}
	},
*/