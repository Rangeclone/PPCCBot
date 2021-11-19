const { Permissions } = require('discord.js');
module.exports = {
	async checkperms(table, member, interaction) {
		if (table === null) return true;
		if (member && table) {
			if (interaction.guild.ownerId === member.id) return true;
			if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return true;
			if (table.users) {
				const searching = member.id;
				for (const i in table.users) {
					if (table.users[i] === searching) {
						return true;
					}
				}
			}
			if (table.roles) {
				for (const z in table.roles) {
					if (member.roles.cache.some(role => role.name === table.roles[z])) {
						return true;
					}
				}
			}
		}
		return false;
	},
};