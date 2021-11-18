const noblox = require('noblox.js');
const config = require('./config.json');
module.exports = {
	// eslint-disable-next-line no-empty-function
	async execute(guildId) {
		if (config.groups && guildId) {
			const selectedgroup = config.groups[String(guildId)];
			if (!selectedgroup) return null;
			noblox.setCookie(selectedgroup[1]).then((currentUser) => {
				console.log(currentUser);
			});
		}
	},
};