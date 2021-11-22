const noblox = require('noblox.js');
const config = require('./config.json');
const request = require('request-promise');
let user = ['', 0, {}];

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
				if (parsedresponse.status === 'error') return { success: false, error: 'Bloxlink API error: ```' + parsedresponse.error + '```' };
				return { success: true, user: parsedresponse.primaryAccount };
			})
				.catch(function(err) {
					return { success: false, error: 'Bloxlink API error: ```' + err + '```' };
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
				if (parsedresponse.success == false) return { success: false, error: 'Roblox API error: ```' + parsedresponse.errorMessage + '```' };
				return { success: true, user: parsedresponse.Id };
			})
				.catch(function(err) {
					return { success: false, error: 'Roblox API error: ```' + err + '```' };
				});
		}
	},
};