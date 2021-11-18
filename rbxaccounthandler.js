const noblox = require('noblox.js');
const config = require('./config.json');
module.exports = {
	async changeaccount(guildId) {
		if (config.groups && guildId) {
			const selectedgroup = config.groups[String(guildId)];
			if (!selectedgroup) return null;
			noblox.setCookie(selectedgroup[1]).then((currentUser) => {
				console.log(currentUser);
			});
		}
	},
};