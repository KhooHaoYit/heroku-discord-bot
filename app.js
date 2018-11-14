'use strict';
function run(channelID){
	const { spawn } = require('child_process');
	let child = spawn('node', ['bot.js', channelID], { stdio: [0, 1, 2, 'ipc'] });
	child.on('message', (channelID) => {
		if(/^\d+$/.test(channelID)){
			console.log('Restart command received: ', channelID);
			run(channelID);
		}
		else{
			console.log('Child responded with: ', channelID);
		}
	});
	child.on('exit', (code) => {
		console.log(`Child exited with code: ${code}`);
		if(code){
			console.log('Child exited unexpectedly, restarting child');
			run();
		}
	});
	child.on('error', (code) => {
		console.log(`Child produced error: ${code}`);
	});
}
run();