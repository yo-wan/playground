const {Client, Events, GatewayIntentBits} = require('discord.js');
const {token} = require('./config.discord.json');
const tmi = require('tmi.js');
const twitchConfig = require('./config.twitch.json');

const discordClient = new Client({
	intents: [GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent]
});

const commands = require('./src/commands');

discordClient.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	// const channel = client.channels.cache.get('459346892720177154');
	const twitchClient = new tmi.Client({
		options: {
			debug: true,
		},
		...twitchConfig
	});

	twitchClient.connect()
		.catch(error => console.log(29, error));

	twitchClient.on('message', (channel, tags, message, self) => {
		let chnl = discordClient.channels.cache.find(channel => "bot" === channel.name);

		chnl.send('Message from ' + tags.username.toString() + '@' + channel + ': ' + message);

		if (message.startsWith('##')) {
			let cmdData = message.substring(1).split(' ');
			let cmd = cmdData.splice(0, 1);

			if (commands.hasOwnProperty(cmd)) {
				let fn = commands[cmd];

				fn(twitchClient, channel, ...cmdData);
			}
		}
	});
});

discordClient.login(token)
	.then(result => console.log('twitch connected'));
