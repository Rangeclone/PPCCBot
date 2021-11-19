const { checkperms } = require('../permissionhandler.js');
module.exports = {
	name: 'interactionCreate',
	execute(client, interaction) {
		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			checkperms(command.permissions || null, interaction.member, interaction).then((response) => {
				if (response === true) {
					command.execute(client, interaction);
				}
				else {
					interaction.reply({ content: 'You do not have sufficent permissions to execute this command.', ephemeral: true });
				}
			});

		}
		catch (error) {
			console.error(error);
			interaction.reply({ content: 'There was an error while executing this command! ```' + error + '```', ephemeral: true });
		}
	},
};