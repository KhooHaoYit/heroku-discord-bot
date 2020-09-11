'use strict';
const st_hd = require('./settings handler.js');
const Discord = require('discord.js');
const vm = require('vm');
const client = new Discord.Client({
  disableEveryone: true,
  partials: 'USER CHANNEL GUILD_MEMBER MESSAGE REACTION'.split(' ')
});

const guilds = {};
const value = {};
const beta = {};
const process_value = {};

async function ProcessMessage(msg){
	var args = msg.content.split(' ');
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
		case 'pin':
			
			break;
		default:
			break;
	}
	guilds[guild.id] = settings;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.cache.forEach(async guild => {
    let channel = guild.channels.cache.find(channel => channel.name == 'backup-bot');
    let settings = {};
    if (channel) {
      channel.messages.fetchPinned().then(async messages => {	//This is slow because of ratelimit
//				await Promise.all(messages.map(msg => {
//					return ProcessMessage(msg);
//				}));
        messages.forEach(message => {
          const args = message.content.split(' ');
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
            case 'eval':
              if(message.author.id != '278157010233589764') return;
              eval(args.slice(1).join(' '));
              console.log(`Evaled code at channel ${channel.id} and message ${message.id}`);
              break;
            default:
              break;
          }
        });
        guilds[guild.id] = settings;
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
    else{
      guilds[guild.id] = {
        remote: {
          space: true,
          prefix: `<@${client.user.id}>`
        },
        settingsLocation: null,
        channel: null
      };
      console.log(`Channel not found, ${guild.name}'s settings is set to default.`);
    }
  });
});

client.on('message', async function(msg){
	if (/^<@!?278157010233589764>/.test(msg.content) && msg.author.id == '278157010233589764' ||
	/^<@!?259066297109839872>/.test(msg.content) && msg.author.id == '259066297109839872' ||
  /^<@!?698966516909080607>/.test(msg.content) && msg.author.id == '698966516909080607') {
		var args = msg.content.split(' ');
		if(RegExp(`<@!?${client.user.id}>`).test(args[1])){
			args = args.splice(2);
			switch (args[0]) {
				case 'test':
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
					const child = require('child_process').spawn('node', ['Custom Command API.js', command], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
					child.on('message', (message) => {
						switch(message.data){
							case 'MessageContent':
								child.send({ data: msg.content, id: message.id })
								break;
							case 'MessageId':
								child.send({ data: msg.id, id: message.id });
								break;
							default:
						}
					});
					let output = { stdout: '', stderr: '' };
					child.stdout.on('data', data => output.stdout += data);
					child.stderr.on('data', data => output.stderr += data);
					child.on('exit', code => {
						if(output.stdout.length){
							msg.channel.send(new Discord.MessageEmbed()
							.setTitle('Stdout:')
							.setTimestamp(msg.createdAt)
							.setDescription(('```js\n' + output.stdout).substr(0, 2044) + '\n```'));
						}
						if(output.stderr.length){
							msg.channel.send(new Discord.MessageEmbed()
							.setTitle('Stderr:')
							.setTimestamp(msg.createdAt)
							.setDescription(('```js\n' + output.stderr).substr(0, 2044) + '\n```'));
						}
					});
					child.on('error', code => console.log(`Child produced error: ${code}`));
					setTimeout(function(){
						child.kill();
						output.stderr += 'Error: ETIMEDOUT (Manual kill)';
					}, 10000);
					break;
				case 'async_function':
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
            command = `async()=>{\n${command}\n}`;
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
            const stack = {};
            Error.captureStackTrace(stack);
						let returned;
						try {
              try{
                returned = await eval(command)();
              } catch(err){
                if(!(err instanceof SyntaxError)) throw err;
                vm.runInNewContext(command, {}, 'emitSyntaxError.vm'); //Cause a error
              }
							if(console.code_block){
								if(console.buffer.length){
									console.buffer = ('```js\n' + console.buffer).substr(0, 2045) + '```';
								}
								else{
									console.buffer = '```js\n\n```';
								}
							}
						} catch (e) {
              if(e instanceof SyntaxError){
                console.buffer = ('```js\n' + e.stack).substr(0, 2045) + '```';
              }
              else{
                try{
                  const lines = e.stack.split('\n');
                  const offset = stack.stack.split('\n').length - 1;
                  let [_, line, char] = lines[lines.length - offset].match(/<anonymous>:(\d+):(\d+)/);
                  line = line - 2;
                  char = +char;
                  console.buffer = ('```js\n' + `
${command.split('\n')[line]}
${' '.repeat(char - 1)}^

${e.stack}`).substr(0, 2045) + '```';
                } catch(_){
                  console.real_log(_);
                  console.buffer = ('```js\n' + e.stack).substr(0, 2045) + '```';
                }
              }
							console.embed = true;
							console.code_block = true;
						}
						let embed;
						if(console.embed){
							embed = new Discord.MessageEmbed()
							.setColor(console.colour)
							.setTitle(console.title)
							.setDescription(String(console.buffer).substr(0, 2048))
							.setImage(console.image)
							.setTimestamp(msg.createdAt)
							.addField('Returned', String(returned).substr(0, 2048));
						}
						msg.channel.send(console.message, embed).catch(console.log);
					}
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
						} catch (err) {
							console.buffer = ('```js\n' + err.stack).substr(0, 2045) + '```';
							console.embed = true;
						}
						let embed;
						if(console.embed){
							embed = new Discord.MessageEmbed()
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
					if(args[1] != process.pid){
						msg.channel.send(`Pid didn't match, my pid is ${process.pid}`);
						break;
					}
					if(args[2] == 'random'){
						process_value['rs'] = Math.random().toString();
						msg.channel.send(`My random value is ${process_value['rs']}`);
						break;
					}
					if(process_value['rs']){
						if(args[2] != process_value['rs']){
							msg.channel.send(`Random value didn't match, my random value is ${process_value['rs']}`);
							break;
						}
					}
					msg.channel.send('Restarting....').then(() => {
						client.destroy();
            process.send(msg.channel.id);
            process.exit();
					});
					break;
			}
		}
	}
	if (msg.content == `<@${client.user.id}> Help!!`) {
		msg.channel.send(`${guilds[msg.guild.id].remote.prefix + (guilds[msg.guild.id].remote.space ? ' ' : '')}COMMAND`);
	}
	let invites = msg.content.match(/discord.gg\/\S+/g);
	if(!guilds[msg.guild.id].disabled && invites){
		invites.forEach(invite => {
			client.fetchInvite(invite)
			.then(invite => {
				if(!msg.guild)
					return
				if(!guilds[msg.guild.id])
					return
				if(!guilds[msg.guild.id].channel)
					return
				const embed = new Discord.MessageEmbed()
				.setColor(0x1177aa)
				.setTitle('Invite information')
				.setDescription(invite.url)
				.setThumbnail(`https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}`)
				.addField('Server\'s name', invite.guild.name, true)
				.addField(`${invite.channel.type[0].toUpperCase() + invite.channel.type.slice(1)} channel's name`, `<#${invite.channel.id}> (#${invite.channel.name})`, true)	//TODO: Make a function that uppercase first letter
				.setTimestamp();
				if(invite.inviter) embed.addField('Invite creator', `<@${invite.inviter.id}> (@${invite.inviter.tag})`, true);
				//TODO: Add other information
				embed.addField('Link to message', msg.url, true);
				guilds[msg.guild.id].channel.send({embed});
			})
			.catch();
		});
	}
	if (msg.author.bot || !msg.guild || !guilds[msg.guild.id])
		return;
	else if (msg.content.substring(0, guilds[msg.guild.id].remote.prefix.length) == guilds[msg.guild.id].remote.prefix) {
		var args = msg.content.substring(guilds[msg.guild.id].remote.prefix.length).split(' ');
		if (guilds[msg.guild.id].remote.space)
			args.shift();
		switch (args[0]) {
			case 'beta':{
				let command = beta[args[1]];
				if(command){
					command(msg, ...args.splice(2));
				}
				break;
			}case 'command':{
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
						msg.channel.send(new Discord.MessageEmbed()
						.setTitle('Stdout:')
						.setTimestamp(msg.createdAt)
						.setDescription(('```js\n' + output.stdout).substr(0, 2044) + '\n```'));
					}
					if(output.stderr.length){
						msg.channel.send(new Discord.MessageEmbed()
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
			}case 'set':
				if (!msg.member.permissions.has('ADMINISTRATOR'))
					//Send message that you don't have permission
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
									icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
						const permissions = Number(args[2]);
						if(Number.isNaN(permissions))
							return;
						if(args.lenght == 4){
							const compare = Number(args[3]);
							if(Number.isNaN(compare))
								return;
							
							return;
						}
						let output = '```js\n';
						for(let name in Discord.Permissions.FLAGS){
							output += `${permissions & Discord.Permissions.FLAGS[name] ? 'true' : 'false'} ${name}\n`;
						}
						output += '```';
						msg.channel.send(new Discord.MessageEmbed()
							.setColor('RANDOM')
							.setDescription(output)
							.setFooter(msg.author.username, msg.author.displayAvatarURL({ size: 32 }))
							.setTimestamp(msg.createdAt)
						);
						break;
					case 'role':
						let role = client.guilds.get(args[2]).roles.get(args[3]);
						const embed = new Discord.MessageEmbed()
						.setColor('RANDOM')
						.setTitle(role.id)
						.setDescription(`<@&${role.id}>`)
						.addField('Name', role.name, true)
						.addField('Colour', '0x' + role.color.toString(16).padStart(6, '0'), true)
						.addField('Hoist', role.hoist, true)
						.addField('Position', role.position, true)
						.addField('Permissions', role.permissions.bitfield, true)
						.addField('Managed', role.managed, true)
						.addField('Mentionable', role.mentionable, true)
						.setFooter(msg.author.username, msg.author.displayAvatarURL({ size: 32 }))
						.setTimestamp(msg.createdAt);
						msg.channel.send({embed});
						break;
					case 'time':
						msg.channel.send({
							embed: {
								color: Math.floor(Math.random() * 0x1000000),
								timestamp: Discord.SnowflakeUtil.deconstruct(args[2]).date,
								footer: {
									icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
									icon_url: user.displayAvatarURL({ size: 32 }),
									url: user.displayAvatarURL({ size: 32 }),
									name: user.username
								},
								image: {
									url: user.displayAvatarURL({ size: 2048 })
								},
								timestamp: msg.createdAt,
								footer: {
									icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
										icon_url: message.author.displayAvatarURL({ size: 32 }),
										url: message.url,
										name: message.author.username
									},
									url: message.url,
									description: message.content,
									image: message.attachments.first(),
									timestamp: msg.createdAt,
									footer: {
										icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
									icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
												icon_url: message.author.displayAvatarURL({ size: 32 }),
												url: message.url,
												name: message.author.username
											},
											url: message.url,
											description: message.content,
											image: message.attachments.first(),
											timestamp: msg.createdAt,
											footer: {
												icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
											icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
			case 'uptime':
				msg.channel.send(new Discord.MessageEmbed()
					.setColor('RANDOM')
					.setTitle('Uptime:')
					.setDescription(`${client.uptime/1000/60}m`)
					.setFooter(msg.author.username, msg.author.displayAvatarURL({ size: 32 }))
					.setTimestamp(msg.createdAt));
				break;
			case 'ping':
				msg.channel.send({
					embed: {
						color: Math.floor(Math.random() * 0x1000000),
						author: {
							icon_url: client.user.displayAvatarURL({ size: 32 }),
							url: client.user.displayAvatarURL({ size: 32 }),
							name: client.user.username
						},
						description: `Pong!!\n${Math.round(client.ping)}ms`,
						timestamp: msg.createdAt,
						footer: {
							icon_url: msg.author.displayAvatarURL({ size: 32 }),
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
							icon_url: msg.author.displayAvatarURL({ size: 32 }),
							text: msg.author.username
						}
					}
				});
				//msg.delete();
				break;
			case 'dev':
				break;
		}
	}
});
client.on('messageDelete', msg => {
	//TODO: Log pinned message properly (And probably other type of message too)
  if(!msg.guild) return;
  if(!guilds[msg.guild.id]) return;
  if(!guilds[msg.guild.id].channel) return;
	if(guilds[msg.guild.id].disabled) return;
  const embed = new Discord.MessageEmbed()
  .setColor(0xbb0000)
  .setTitle('Message deleted in')
  .setDescription(`<#${msg.channel.id}> ${msg.channel.id} \`#${msg.channel.name}\``)
  .setFooter(`Message id: ${msg.id}`, '')
  .setTimestamp();
  if(msg.partial) embed.addField('Partial', 'True');
  else{
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 32 }));
    if(msg.content.length > 1024){
        const at = Math.floor(msg.content.length/2);
        embed.addField('Content front', `${msg.content.substring(0, at)}_ _`);
        embed.addField('Content end', `_ _ ${msg.content.substring(at)}`);
    }
    else{
        embed.addField('Content', msg.content || '_ _');
    }
    msg.attachments.forEach(ath => embed.addField('Attachment', ath.url));
  }
  guilds[msg.guild.id].channel.send({embed}).catch(e => { console.log(e.stack); });
});

client.on('messageDeleteBulk', async msgs => {
  const firstMsg = msgs.first();
  if(!firstMsg.guild) return;
  const guildId = firstMsg.guild.id;
  if(!guilds[guildId]) return;
  if(!guilds[guildId].channel) return;
  if(guilds[guildId].disabled) return;
  msgs = Array.from(msgs.values());
  for(const index in msgs){
    const msg = msgs[index];
    //TODO: Log pinned message properly (And probably other type of message too)
    const embed = new Discord.MessageEmbed()
    .setColor(0xbb0000)
    .setTitle('Message deleted in')
    .setDescription(`\
<#${msg.channel.id}> ${msg.channel.id} \`#${msg.channel.name}\`
> Bulk delete
First message id: ${firstMsg.id}
Current index: ${Number(index) + 1}/${msgs.length}\
`)
    .setFooter(`Message id: ${msg.id}`, '')
    .setTimestamp();
    if(msg.partial) embed.addField('Partial', 'True');
    else{
      embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 32 }))
      if(msg.content.length > 1024){
          const at = Math.floor(msg.content.length/2);
          embed.addField('Content front', `${msg.content.substring(0, at)}_ _`);
          embed.addField('Content end', `_ _ ${msg.content.substring(at)}`);
      }
      else{
          embed.addField('Content', msg.content || '_ _');
      }
      msg.attachments.forEach(ath => embed.addField('Attachment', ath.url));
    }
    await guilds[msg.guild.id].channel.send({embed}).catch(e => { console.log(e.stack); });
  }
});

client.on('messageUpdate', (oldMsg, newMsg) => {
  if(!newMsg.guild) return;
  if(!guilds[newMsg.guild.id]) return;
  if(!guilds[newMsg.guild.id].channel) return;
	if(guilds[newMsg.guild.id].disabled) return;
  if(oldMsg.content == newMsg.content) return;
  if(newMsg.channel.id == '547001590301589504') return;
  const embed = new Discord.MessageEmbed()
  .setColor(0xff9900)
  .setTitle('Message edited at')
  .setDescription(`<#${newMsg.channel.id}> ${newMsg.channel.id} \`#${newMsg.channel.name}\``)
  .addField('Link to message', newMsg.url)
  .setFooter(`Message id: ${newMsg.id}`, '')
  .setTimestamp();
	//Need '_ _' to prevent RangeError: MessageEmbed field values may not be empty.
  if(oldMsg.partial) embed.addField('Old message partial', 'True');
  else{
    if(oldMsg.content.length > 1024){
      const at = Math.floor(oldMsg.content.length/2);
      embed.addField('Old content front', `${oldMsg.content.substring(0, at)}_ _`);
      embed.addField('Old content end', `_ _${oldMsg.content.substring(at)}`);
    }
    else embed.addField('Old content', oldMsg.content || '_ _');
  }
  if(newMsg.partial) embed.addField('New message partial', 'True');
  else{
    if(newMsg.content.length > 1024){
      const at = Math.floor(newMsg.content.length/2);
      embed.addField('New content front', `${newMsg.content.substring(0, at)}_ _`);
      embed.addField('New content end', `_ _ ${newMsg.content.substring(at)}`);
    }
    else embed.addField('New content', newMsg.content || '_ _');
    embed.setAuthor(newMsg.author.username, newMsg.author.displayAvatarURL({ size: 32 }))
  }
  guilds[oldMsg.guild.id].channel.send({embed}).catch(console.log);
});

client.on('roleCreate', role => {
	if(!role.guild)
		return
	if(!guilds[role.guild.id])
		return
	if(!guilds[role.guild.id].channel)
		return
	if(guilds[role.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0x00ff00)
	.setTitle('Role created')
	.setDescription(`<@&${role.id}> (${role.id})`)
	.addField('Name', role.name, true)
	.addField('Colour', '0x' + role.color.toString(16).padStart(6, '0'), true)
	.addField('Hoist', role.hoist, true)
	.addField('Position', role.position, true)
	.addField('Permissions', role.permissions.bitfield, true)
	.addField('Managed', role.managed, true)
	.addField('Mentionable', role.mentionable, true)
//	.addField('Calculated position', role.calculatedPosition, true)
	.setTimestamp();
	guilds[role.guild.id].channel.send({embed});
});

client.on('roleUpdate', (oldRole, newRole) => {
	if(!oldRole.guild)
		return
	if(!guilds[oldRole.guild.id])
		return
	if(!guilds[oldRole.guild.id].channel)
		return
	if(guilds[oldRole.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0xffff00)
	.setTitle('Role updated')
	.setDescription(`<@&${oldRole.id}> (${oldRole.id})`)
	.setTimestamp();
	if(oldRole.name != newRole.name)
		embed.addField('Name', `${oldRole.name} -> ${newRole.name}`, true);
	if(oldRole.color != newRole.color)
		embed.addField('Colour', `0x${oldRole.color.toString(16).padStart(6, '0')} -> 
		0x${newRole.color.toString(16).padStart(6, '0')}`, true);
	if(oldRole.hoist != newRole.hoist)
		embed.addField('Hoist', `${oldRole.hoist} -> ${newRole.hoist}`, true);
	if(oldRole.position != newRole.position)
		embed.addField('Position', `${oldRole.position} -> ${newRole.position}`, true);
	if(oldRole.permissions.bitfield != newRole.permissions.bitfield)
		embed.addField('Permissions', `${oldRole.permissions.bitfield} -> ${newRole.permissions.bitfield}`, true);
	if(oldRole.managed != newRole.managed)
		embed.addField('Managed', `${oldRole.managed} -> ${newRole.managed}`, true);
	if(oldRole.mentionable != newRole.mentionable)
		embed.addField('Mentionable', `${oldRole.mentionable} -> ${newRole.mentionable}`, true);
//	.addField('Calculated position', oldRole.calculatedPosition + 
//	(oldRole.calculatedPosition != newRole.calculatedPosition ? ' -> ' + newRole.calculatedPosition : ''), true)
	guilds[oldRole.guild.id].channel.send({embed});
});

client.on('roleDelete', (role) => {
	if(!role.guild)
		return
	if(!guilds[role.guild.id])
		return
	if(!guilds[role.guild.id].channel)
		return
	if(guilds[role.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0xff0000)
	.setTitle('Role deleted')
	.setDescription(`<@&${role.id}> (${role.id})`)
	.addField('Name', role.name, true)
	.addField('Colour', '0x' + role.color.toString(16).padStart(6, '0'), true)
	.addField('Hoist', role.hoist, true)
	.addField('Position', role.position, true)
	.addField('Permissions', role.permissions.bitfield, true)
	.addField('Managed', role.managed, true)
	.addField('Mentionable', role.mentionable, true)
//	.addField('Calculated position', role.calculatedPosition, true)
	.setTimestamp();
	guilds[role.guild.id].channel.send({embed});
});

client.on('channelCreate', (channel) => {
	if(!channel.guild)
		return
	if(!guilds[channel.guild.id])
		return
	if(!guilds[channel.guild.id].channel)
		return
	if(guilds[channel.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0xff0000)
	.setTitle('Channel created')
	.setDescription(`<#${channel.id}> (${channel.id})`)
	.addField('Name', channel.name, true)
	.setTimestamp();
	guilds[channel.guild.id].channel.send({embed});
});

client.on('channelUpdate', (oldChannel, newChannel) => {
//	console.log(oldChannel.permissionOverwrites);
//	console.log(newChannel.permissionOverwrites);
//	console.log(oldChannel.permissionOverwrites.equals(newChannel.permissionOverwrites));
});

client.on('channelDelete', (channel) => {
	if(!channel.guild)
		return
	if(!guilds[channel.guild.id])
		return
	if(!guilds[channel.guild.id].channel)
		return
	if(guilds[channel.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0xff0000)
	.setTitle('Channel deleted')
	.setDescription(`<#${channel.id}> (${channel.id})`)
	.addField('Name', channel.name, true)
	.addField('Topic', channel.topic, true)
	.addField('Nsfw', channel.nsft, true)
	.addField('@everyone permission', 'Allow: ' + channel.permissionOverwrites.get('501043184361537547').allowed +
	'\nDenied: ' + channel.permissionOverwrites.get('501043184361537547').denied, true)
	.setTimestamp();
	guilds[channel.guild.id].channel.send({embed});
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
	if(!oldMember.guild)
		return
	if(!guilds[oldMember.guild.id])
		return
	if(!guilds[oldMember.guild.id].channel)
		return
	if(guilds[oldMember.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0xffff00)
	.setTitle('Member updated')
	.setDescription(`<@${oldMember.id}> (${oldMember.id})`)
	.setTimestamp();
	if(oldMember.nickname != newMember.nickname){
		embed.addField('Nickname', `${oldMember.nickname} -> ${newMember.nickname}`, true);
	}
	else{
		return;
	}
	guilds[oldMember.guild.id].channel.send({embed});
});

client.on('guildMemberRemove', (member) => {
	if(!member.guild)
		return
	if(!guilds[member.guild.id])
		return
	if(!guilds[member.guild.id].channel)
		return
	if(guilds[member.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0xff0000)
	.setTitle('Member left')
	.setDescription(`<@${member.id}> ${member.id} ${member.user.tag}`)
	.setThumbnail(member.user.displayAvatarURL({ size: 2048 }))
	.setTimestamp();
	guilds[member.guild.id].channel.send({embed});
});

client.on('guildMemberAdd', (member) => {
	if(!member.guild)
		return
	if(!guilds[member.guild.id])
		return
	if(!guilds[member.guild.id].channel)
		return
	if(guilds[member.guild.id].disabled) return;
	const embed = new Discord.MessageEmbed()
	.setColor(0x00ff00)
	.setTitle('Member joined')
	.setDescription(`<@${member.id}> ${member.id} ${member.user.tag}`)
	.setThumbnail(member.user.displayAvatarURL({ size: 2048 }))
	.setTimestamp();
	guilds[member.guild.id].channel.send({embed});
});

client.on('messageReactionAdd', (messageReaction, user) => {
  const msg = messageReaction.message, guild = msg.guild;
  if(!guild) return;
  const channel = guild.channels.cache.filter(c => c.name == 'backup-bot-reaction').first();
	if(!channel)
		return
	if(guilds[guild.id].disabled) return;
	const emoji = messageReaction.emoji, embed = new Discord.MessageEmbed()
	.setColor(0xaddfff)
	.setTitle('Reaction added')
	.setDescription(`<@${user.id}> ${user.id} ${user.tag}\n${msg.url}`)
  .addField('Emoji', `${emoji} :${emoji.name}: (${emoji.id})`)
	.setThumbnail(user.displayAvatarURL({ size: 2048 }))
	.setTimestamp();
	channel.send({embed});
});

client.on('messageReactionRemove', (messageReaction, user) => {
  const msg = messageReaction.message, guild = msg.guild;
  if(!guild) return;
  const channel = guild.channels.cache.filter(c => c.name == 'backup-bot-reaction').first();
	if(!channel)
		return
	if(guilds[guild.id].disabled) return;
	const emoji = messageReaction.emoji, embed = new Discord.MessageEmbed()
	.setColor(0xaddfff)
	.setTitle('Reaction removed')
	.setDescription(`<@${user.id}> ${user.id} ${user.tag}\n${msg.url}`)
  .addField('Emoji', `${emoji} :${emoji.name}: (${emoji.id})`)
	.setThumbnail(user.displayAvatarURL({ size: 2048 }))
	.setTimestamp();
	channel.send({embed});
});
/*
Red 0xff0000
Dark red 0xbb0000
Orange 0xff9900
Yellow 0xffff00
Green 0x00ff00
Light Blue 0xaddff
Blue 0x1177aa
*/
client.on('error', console.log);

client.once('ready', () => {
  if(!process.argv[2]) return;
  const channel = client.channels.cache.get(process.argv[2]);
  if(!channel) return;
  channel.send('Restarted!!');
});

function LoginUsingFile(){
	console.log('Logging using file....');
	try{
		client.login(require('./auth.json').token);
	}catch(e){
		console.log('Failed to load token from a file....');
	}
}

if(process.env.token){
	console.log('Found token in "process.env", using it to login....');
	client.login(process.env.token)
	.catch(() => {
		console.log('Login failed....');
		LoginUsingFile();
	});
	process.env.token = undefined;
}
else{
	LoginUsingFile();
}

process.stdin.on('data', _ => console.log(eval(_.toString('utf8'))));