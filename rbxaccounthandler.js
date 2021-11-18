const noblox = require('noblox.js');
const config = require('./config.json');
module.exports = {
	async changeaccount(guildId) {
		if (config.groups && guildId) {
			const selectedgroup = config.groups[String(guildId)];
			if (!selectedgroup) return null;
			return noblox.setCookie(selectedgroup[1]).then(function(res) {
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
		}
	},
};