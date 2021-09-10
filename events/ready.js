const config = require('../config.json');
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		// client.user.setActivity(config.status.text, { type: config.status.type });
		client.user.setPresence({ activities: [{ name: config.status.text, type: config.status.type }], status: config.status.online });
	},
};