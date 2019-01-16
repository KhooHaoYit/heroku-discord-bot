module.exports.settings = {}
module.exports.functions = {}
module.exports.settings.command = { info: 'Run javascript code.' };
module.exports.functions.command = function(){
	if(!(msg.member.roles.get('501044453583093790') || msg.member.roles.get('501040116870021120')))
		return;
	let command = args.splice(1).join(' ').split('```');
	if(!(command[0] || command[command.length - 1])){
		command.shift();
		command.pop();
		command = command.join('```');
		command.replace(/^j(?:ava)?s(?:cript)?\n/i, '');
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
		if(child.exitCode !== null){
			child.kill();
			output.stderr += 'Error: ETIMEDOUT';
		}
	}, 1000);
}