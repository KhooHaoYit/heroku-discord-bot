function edit_no_sync(guilds, guildID, name, value){
	guilds[guildID].remote[name] = value;
}

function edit_sync(guilds, client, guildID, name, value){
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

function get(guilds, guildID, name){
	return guilds[guildID].remote[name];
}

module.exports = {
	edit_no_sync: edit_no_sync,
	edit_sync: edit_sync,
	get: get,
}