const util = require('./util.js');
module.exports.edit_no_sync = (guilds, guildID, name, value) => {
	guilds[guildID].remote[name] = value;
}

module.exports.edit_sync = (guilds, client, guildID, name, value) => {
	let settings = guilds[guildID];
	settings.remote[name] = value;
	if(settings.settingsLocation){
		/*let channel = client.channels.get(settings.settingsLocation.channelID);
		channel.fetchMessage(settings.settingsLocation.messageID)
		.then(message => {
			if(message){
				message.edit(`settings ${JSON.stringify(settings.remote.space)} ${JSON.stringify(settings.remote.prefix)}`);
			}
		});*/
		settings.settingsLocation.edit(`settings ${JSON.stringify(settings.remote.space)} ${JSON.stringify(settings.remote.prefix)}`);
	}
}

module.exports.get = (guilds, guildID, name) => {
	return guilds[guildID].remote[name];
}

async function ProcessMessage(message){
	var args = message.content.split(' ');
	switch (args[0]) {
		case 'settings':
			if(message.author.id == client.user.id){
				settings = {
					remote: {
						space: JSON.parse(args[1]),
						prefix: JSON.parse(args.slice(2).join(' '))
					},
					settingsLocation: message,
					channel: message.channel
				};
				console.log(`${guild.name}'s settings is loaded.`);
			}
			break;
		case 'link':
			break;
		case 'cc':
			break;
		case 'pin':
			args = args.splice(1).join(' ').match(/..../g);
			args.forEach(id_en => {
				message.channel.fetchMessage(util.U64ToString(id_en)).then(msg => {
					ProcessMessage(msg);
				}).catch(console.log);
			});
			break;
		default:
			break;
	}
	guilds[guild.id] = settings;
}

module.exports.ProcessMessage = ProcessMessage;