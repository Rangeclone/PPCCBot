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
	/* async comparegroupranks(interaction, group, targetid, rankid) {
		const member = interaction.member;
		const options = {
			url: 'https://api.blox.link/v1/user/' + String(member.id),
			method: 'GET',
			headers: {
				'Accept': 'text/html',
				'User-Agent': 'Chrome',
			},
		};
		return await request(options, async function(error, rbxresponse) {
			const req = rbxresponse.body;
			if (!req) return { success: false, error: 'Oops! We are currently have a problem communicating with bloxlink.' };
			const req2 = JSON.parse(rbxresponse.body);
			if (req2.status === 'error') return { success: false, error: 'Bloxlink API Error: ' + req2.error };
			const speakerid = req2.primaryAccount;
			const speakerrank = await noblox.getRankInGroup(group, Number(speakerid));
			const targetrank = Number(rankid) || await noblox.getRankInGroup(group, Number(targetid));
			if (speakerrank === targetrank) return { success: false, error: 'You are unable to manage the same rank as yourself.' };
			if (speakerrank < targetrank) return { success: false, error: 'You are unable to manage ranks above yourself.' };
			if (speakerrank > targetrank) return { success: true };
			return { success: false, error: 'An unknown error occoured.' };
		});
	}, */
};