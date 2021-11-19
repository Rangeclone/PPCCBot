const noblox = require('noblox.js');
const config = require('./config.json');
let user = ['', 0, {}];
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
};