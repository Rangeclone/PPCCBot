const request = require('request');

module.exports = {
	// eslint-disable-next-line no-empty-function
	async execute(options) {
		request(options, function(error, response) {
			if (!response) return null;
			if (!response.body) return null;
			return response.body;
		});
	},
};