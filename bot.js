'use strict';
const st_hd = require('./settings handler.js');
const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: true });

const guilds = {};
let value = {};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.guilds.forEach(guild => {
		let channel = guild.channels.find(channel => channel.name == 'backup-bot');
		let settings = {};
		if (channel) {
			channel.fetchPinnedMessages().then(messages => { 
				messages.forEach(message => {
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
									channel: channel
								};
								console.log(`${guild.name}'s settings is loaded.`);
							}
							break;
						case 'link':
							break;
						case 'cc':
							
							break;
						default:
							break;
					}
					guilds[guild.id] = settings;
				});
				if (!settings.remote) {
					channel.send('settings true "<@' + client.user.id + '>"').then(message => {
						guilds[guild.id] = {
							remote: {
								space: true,
								prefix: `<@${client.user.id}>`
							},
							settingsLocation: message,
							channel: channel
						};
					});
					console.log(`${guild.name}'s settings is set to default.`);
				}
			});
		}
	});
});

client.on('message', msg => {
	if (msg.content.substring(0, 21) == '<@278157010233589764>' && msg.author.id == '278157010233589764') {
		var args = msg.content.split(' ');
		if(args[1] == `<@${client.user.id}>`){
			args = args.splice(2);
			switch (args[0]) {
				case 'b':
					client.channels.get(args[1]).fetchMessage(args[2]).then(msg => {
						msg.react('⭕').then(msg => {
							msg.message.react('❌').then(msg => {
								msg.message.react('✅');
							}).catch(console.error);
						}).catch(console.error);
					}).catch(console.error);
					break;
				case 'eval':
					let command = args.splice(1).join(' ').split('```');
					if(!(command[0] || command[command.length - 1])){
						command.shift();
						command.pop();
						command = command.join('```');
						if(command.substr(0, 11).toLowerCase() == 'javascript\n'){
							command = command.substr(11);
						}
						else if(command.substr(0, 3).toLowerCase() == 'js\n'){
							command = command.substr(3);
						}
					}
					else{
						command = command.join('```');
					}
					eval(command);
					break;
				case 'command':
					{
						let command = args.splice(1).join(' ').split('```');
						if(!(command[0] || command[command.length - 1])){
							command.shift();
							command.pop();
							command = command.join('```');
							if(command.substr(0, 11).toLowerCase() == 'javascript\n'){
								command = command.substr(11);
							}
							else if(command.substr(0, 3).toLowerCase() == 'js\n'){
								command = command.substr(3);
							}
						}
						else{
							command = command.join('```');
						}
						let console = {
							embed: true,
							image: '',
							message: '',
							code_block: true,
							colour: 0xaddfff,
							title: 'Output:',
							buffer: '',
							log: (input) => console.buffer += (input + '\n'),
							real_log: require('./wrapper.js').console.log
						}
						try {
							eval(command);
							if(console.code_block){
								if(console.buffer.length){
									console.buffer = ('```js\n' + console.buffer).substr(0, 2045) + '```';
								}
								else{
									console.buffer = '```js\n\n```';
								}
							}
						} catch (e) {
							console.buffer = ('```js\n' + e).substr(0, 2045) + '```';
							console.embed = true;
						}
						let embed;
						if(console.embed){
							embed = new Discord.RichEmbed()
							.setColor(console.colour)
							.setTitle(console.title)
							.setDescription(String(console.buffer).substr(0, 2048))
							.setImage(console.image)
							.setTimestamp(msg.createdAt);
						}
						msg.channel.send(console.message, embed).catch(console.log);
					}
					break;
				case 'rs':
					msg.channel.send('Restarting....').then(() => {
						//msg.delete();
						client.destroy().then(() => {
							process.send(msg.channel.id);
							process.exit();
							//throw 'Restarting....';
						});
					});
					break;
			}
		}
	}
	if (msg.content == `<@${client.user.id}> Help!!`) {
		msg.channel.send(`${guilds[msg.guild.id].remote.prefix + (guilds[msg.guild.id].remote.space ? ' ' : '')}COMMAND`);
	}
	if (!msg.guild)
		return;
	if (!guilds[msg.guild.id] || msg.author.bot)
		return;
	else if (msg.content.substring(0, guilds[msg.guild.id].remote.prefix.length) == guilds[msg.guild.id].remote.prefix) {
		var args = msg.content.substring(guilds[msg.guild.id].remote.prefix.length).split(' ');
		console.log(msg.content.substring(0, guilds[msg.guild.id].remote.prefix.length));
		console.log(guilds[msg.guild.id].remote.prefix);
		console.log(msg.content.substring(guilds[msg.guild.id].remote.prefix.length));
		console.log(args);
		if (guilds[msg.guild.id].remote.space)
			args.shift();
		console.log(args);
		switch (args[0]) {
			case 'command':
				if(!(msg.member.roles.get('501044453583093790') || msg.member.roles.get('501040116870021120')))
					return;
				let command = args.splice(1).join(' ').split('```');
				if(!(command[0] || command[command.length - 1])){
					command.shift();
					command.pop();
					command = command.join('```');
					if(command.substr(0, 11).toLowerCase() == 'javascript\n'){
						command = command.substr(11);
					}
					else if(command.substr(0, 3).toLowerCase() == 'js\n'){
						command = command.substr(3);
					}
				}
				else{
					command = command.join('```');
				}
				const child = require('child_process').spawn('node', ['wrapper eval.js', command]);
				let output = { stdout: '', stderr: '' };
				child.stdout.on('data', data => output.stdout += data);
				child.stderr.on('data', data => output.stderr += data);
				child.on('exit', code => {
					if(output.stdout.length){
						msg.channel.send(new Discord.RichEmbed()
						.setTitle('Stdout:')
						.setTimestamp(msg.createdAt)
						.setDescription(('```js\n' + output.stdout).substr(0, 2044) + '\n```'));
					}
					if(output.stderr.length){
						msg.channel.send(new Discord.RichEmbed()
						.setTitle('Stderr:')
						.setTimestamp(msg.createdAt)
						.setDescription(('```js\n' + output.stderr).substr(0, 2044) + '\n```'));
					}
				});
				child.on('error', code => console.real_log(`Child produced error: ${code}`));
				setTimeout(function(){
					child.kill();
					output.stderr += 'Error: ETIMEDOUT';
				}, 1000);
				break;
			case 'set':
				if (!msg.member.permissions.has('ADMINISTRATOR'))
					return;
				switch (args[1]) {
					case 'prefix':
						args.splice(0, 2);
						st_hd.edit_sync(guilds, client, msg.guild.id, 'prefix', args.join(' '));
						msg.channel.send(`Prefix has been set to ${guilds[msg.guild.id].remote.prefix}`);
						break;
					case 'space':
						switch (args[2]) {
							case 'true':
								st_hd.edit_sync(guilds, client, msg.guild.id, 'space', true);
								msg.channel.send(`Space after prefix has been set to ${guilds[msg.guild.id].remote.space}`);
								break;
							case 'false':
								st_hd.edit_sync(guilds, client, msg.guild.id, 'space', false);
								msg.channel.send(`Space after prefix has been set to ${guilds[msg.guild.id].remote.space}`);
								break;
							default:
								msg.channel.send('Error, invalid parameter....');
						}
						break;
				}
				break;
			case 'send':
				switch (args[1]) {
					case 'image':
						msg.channel.send({
							embed: {
								color: Math.floor(Math.random() * 0x1000000),
								image: {
									url: args[2]
								},
								timestamp: msg.createdAt,
								footer: {
									icon_url: msg.author.avatarURL,
									text: msg.author.username
								}
							}
						});
						//msg.delete();
						break;
				}
				break;
			case 'get':
				switch (args[1]) {	//Add emoji
					case 'permissions':
						console.log('get permissions not working....');
						return;
						let permissions = Number(args[1]);
						let output = '';
						for(let name in Discord.Permissions.FLAGS){
							output += `${permissions & Discord.Permissions.FLAGS[name] ? 'true' : 'false'} ${name}\n`;
						}
						msg.channel.send({
							embed: {
								color: Math.floor(Math.random() * 0x1000000),
								description: output,
								footer: {
									icon_url: msg.author.avatarURL,
									text: msg.author.username
								}
							}
						});
						break;
					case 'role':
						let role = client.guilds.get(args[2]).roles.get(args[3]);
						const embed = new Discord.RichEmbed()
						.setColor(Math.floor(Math.random() * 0x1000000))
						.setTitle(role.id)
						.setDescription(`<@&${role.id}>`)
						.addField('Name', role.name, true)
						.addField('Colour', '0x' + role.color.toString(16).padStart(6, '0'), true)
						.addField('Hoist', role.hoist, true)
						.addField('Position', role.position, true)
						.addField('Permissions', role.permissions, true)
						.addField('Managed', role.managed, true)
						.addField('Mentionable', role.mentionable, true)
						.setFooter(msg.author.username, msg.author.avatarURL)
						.setTimestamp(msg.createdAt);
						msg.channel.send({embed});
						break;
					case 'time':
						msg.channel.send({
							embed: {
								color: Math.floor(Math.random() * 0x1000000),
								timestamp: Discord.SnowflakeUtil.deconstruct(args[2]).date,
								footer: {
									icon_url: msg.author.avatarURL,
									text: msg.author.username
								}
							}
						});
						break;
					case 'avatar':
						let user = client.users.get(args[2]);
						msg.channel.send({
							embed: {
								color: Math.floor(Math.random() * 0x1000000),
								author: {
									icon_url: user.avatarURL,
									url: user.avatarURL,
									name: user.username
								},
								image: {
									url: user.displayAvatarURL
								},
								timestamp: msg.createdAt,
								footer: {
									icon_url: msg.author.avatarURL,
									text: msg.author.username
								}
							}
						});
						//msg.delete();
						break;
					case 'prefix':
						msg.channel.send(`Here is my prefix, \`${guilds[msg.guild.id].remote.prefix}\`.`);
						break;
					case 'space':
						msg.channel.send(`Space after the prefix?? ${guilds[msg.guild.id].remote.space}`);
						break;
					case 'embed':
						client.channels.get(args[2]).fetchMessage(args[3]).then(message => {
							msg.channel.send({
								embed: message.embeds[0]
							});
							//msg.delete();
						}).catch(console.error);
						break;
					case 'message':
						client.channels.get(args[2]).fetchMessage(args[3]).then(message => {
							msg.channel.send({
								embed: {
									color: Math.floor(Math.random() * 0x1000000),
									author: {
										icon_url: message.author.avatarURL,
										url: message.url,
										name: message.author.username
									},
									url: message.url,
									description: message.content,
									image: message.attachments.first(),
									timestamp: msg.createdAt,
									footer: {
										icon_url: msg.author.avatarURL,
										text: msg.author.username
									}
								}
							});
							//msg.delete();
						}).catch(console.error);
						break;
					case 'channel':
						var channel = client.channels.get(args[2]);
						msg.channel.send({
							embed: {
								color: Math.floor(Math.random() * 0x1000000),
								description: `<#${channel.id}> (${channel.id})`,
								timestamp: msg.createdAt,
								footer: {
									icon_url: msg.author.avatarURL,
									text: msg.author.username
								}
							}
						}).then(function () { msg.delete() })
							.catch(console.error);
						break;
					default:
						args = args[1].split('/');
						switch (args[3]) {
							case 'channels':
								client.guilds.get(args[4]).channels.get(args[5]).fetchMessage(args[6]).then(message => {
									console.log(message.attachments.first());
									msg.channel.send({
										embed: {
											color: Math.floor(Math.random() * 0x1000000),
											author: {
												icon_url: message.author.avatarURL,
												url: message.url,
												name: message.author.username
											},
											url: message.url,
											description: message.content,
											image: message.attachments.first(),
											timestamp: msg.createdAt,
											footer: {
												icon_url: msg.author.avatarURL,
												text: msg.author.username
											}
										}
									});
									//msg.delete();
								}).catch(console.error);
								break;
							case 'emojis':
							case 'attachments':
								msg.channel.send({
									embed: {
										color: Math.floor(Math.random() * 0x1000000),
										image: {
											url: args.join('/')
										},
										timestamp: msg.createdAt,
										footer: {
											icon_url: msg.author.avatarURL,
											text: msg.author.username
										}
									}
								});
								//msg.delete();
								break;
						}
						break;
				}
				break;
			case '<@278157010233589764>':
				msg.channel.send({
					files: ['https://cdn.discordapp.com/attachments/501967224291196928/502734368100581376/Konuko_-_Toumei_Elegy.jpg']
				})
				break;
			case 'ping':
				msg.channel.send({
					embed: {
						color: Math.floor(Math.random() * 0x1000000),
						author: {
							icon_url: client.user.avatarURL,
							url: client.user.avatarURL,
							name: client.user.username
						},
						description: `Pong!!\n${Math.round(client.ping)}ms`,
						timestamp: msg.createdAt,
						footer: {
							icon_url: msg.author.avatarURL,
							text: msg.author.username
						}
					}
				});
				break;
			case 'id':
				msg.channel.send({
					embed: {
						color: Math.floor(Math.random() * 0x1000000),
						author: {
							name: args[1]
						},
						description: `<@${args[1]}>\n<@&${args[1]}>\n<#${args[1]}>\n(It will show picture if the id is emoji/animated emoji)`,
						thumbnail: {
							url: `https://cdn.discordapp.com/emojis/${args[1]}`
						},
						image: {
							url: `https://cdn.discordapp.com/emojis/${args[1]}.gif`
						},
						timestamp: msg.createdAt,
						footer: {
							icon_url: msg.author.avatarURL,
							text: msg.author.username
						}
					}
				});
				//msg.delete();
				break;
		}
	}
});

client.on('roleCreate', (role) => {
	if(!guilds[role.guild.id])
		return
	if(!guilds[role.guild.id].channel)
		return
	const embed = new Discord.RichEmbed()
	.setColor(0x00ff00)
	.setTitle('Role created')
	.setDescription(`<@&${role.id}> (${role.id})`)
	.addField('Name', role.name, true)
	.addField('Colour', '0x' + role.color.toString(16).padStart(6, '0'), true)
	.addField('Hoist', role.hoist, true)
	.addField('Position', role.position, true)
	.addField('Permissions', role.permissions, true)
	.addField('Managed', role.managed, true)
	.addField('Mentionable', role.mentionable, true)
//	.addField('Calculated position', role.calculatedPosition, true)
	.setTimestamp();
	guilds[role.guild.id].channel.send({embed});
});

client.on('roleUpdate', (oldRole, newRole) => {
	if(!guilds[oldRole.guild.id])
		return
	if(!guilds[oldRole.guild.id].channel)
		return
	const embed = new Discord.RichEmbed()
	.setColor(0xffff00)
	.setTitle('Role updated')
	.setDescription(`<@&${oldRole.id}> (${oldRole.id})`)
	.addField('Name', oldRole.name + (oldRole.name != newRole.name ? ' -> ' + newRole.name : ''), true)
	.addField('Colour', '0x' + oldRole.color.toString(16).padStart(6, '0') + 
	(oldRole.color != newRole.color ? ' -> 0x' + newRole.color.toString(16).padStart(6, '0') : ''), true)
	.addField('Hoist', oldRole.hoist + (oldRole.hoist != newRole.hoist ? ' -> ' + newRole.hoist : ''), true)
	.addField('Position', oldRole.position + (oldRole.position != newRole.position ? ' -> ' + newRole.position : ''), true)
	.addField('Permissions', oldRole.permissions + (oldRole.permissions != newRole.permissions ? ' -> ' + newRole.permissions : ''), true)
	.addField('Managed', oldRole.managed + (oldRole.managed != newRole.managed ? ' -> ' + newRole.managed : ''), true)
	.addField('Mentionable', oldRole.mentionable + (oldRole.mentionable != newRole.mentionable ? ' -> ' + newRole.mentionable : ''), true)
//	.addField('Calculated position', oldRole.calculatedPosition + 
//	(oldRole.calculatedPosition != newRole.calculatedPosition ? ' -> ' + newRole.calculatedPosition : ''), true)
	.setTimestamp();
	guilds[oldRole.guild.id].channel.send({embed});
});

client.on('roleDelete', (role) => {
	if(!guilds[role.guild.id])
		return
	if(!guilds[role.guild.id].channel)
		return
	const embed = new Discord.RichEmbed()
	.setColor(0xff0000)
	.setTitle('Role deleted')
	.setDescription(`<@&${role.id}> (${role.id})`)
	.addField('Name', role.name, true)
	.addField('Colour', '0x' + role.color.toString(16).padStart(6, '0'), true)
	.addField('Hoist', role.hoist, true)
	.addField('Position', role.position, true)
	.addField('Permissions', role.permissions, true)
	.addField('Managed', role.managed, true)
	.addField('Mentionable', role.mentionable, true)
//	.addField('Calculated position', role.calculatedPosition, true)
	.setTimestamp();
	guilds[role.guild.id].channel.send({embed});
});

client.on('channelCreate', (channel) => {
	console.log(channel);
});

client.on('channelUpdate', (oldChannel, newChannel) => {
	console.log(oldChannel.permissionOverwrites);
	console.log(newChannel.permissionOverwrites);
	console.log(oldChannel.permissionOverwrites.equals(newChannel.permissionOverwrites));
});

client.on('channelDelete', (channel) => {
	console.log(channel);
});

function check_restarted_properly(){
	if(process.argv[2]){
		let channel = client.channels.get(process.argv[2]);
		if(channel){
			channel.send('Restarted!!');
		}
	}
}

function LoginUsingFile(){
	console.log('Logging using file....')
	try{
		client.login(require('./auth.json').token).then(check_restarted_properly);
	}catch(e){
		console.log('Failed to load token from a file....');
	}
}

if(process.env.token){
	console.log('Found token in "process.env", using it to login....');
	client.login(process.env.token)
	.then(check_restarted_properly)
	.catch(() => {
		console.log('Login failed....');
		LoginUsingFile();
	});
	process.env.token = undefined;
}
else{
	LoginUsingFile();
}