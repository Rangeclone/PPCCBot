const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const { changeaccount } = require('../rbxaccounthandler.js');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Ask the 8 Ball any question you want.')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('Question to ask.')
				.setRequired(true)),
	async execute(client, interaction) {
		const questiont = interaction.options.get('question').value;
		let replies = ["Yes", "No", "I don't know", "Ask again later!", "Cyka", "I am not sure!", "Pls No", "You tell me", "Without a doubt", "Cannot predict now", "Without a doubt", ];

		let result = Math.floor((Math.random() * replies.length));
	
		let ballembed = new Discord.MessageEmbed()
		
		.setAuthor(interaction.member.user.username)
		.setColor("#00ff00")
		.addField("Question", questiont)
		.addField("Answer", replies[result]);
	
		interaction.reply({ content: ' ', embeds: [ballembed]})
	},
};