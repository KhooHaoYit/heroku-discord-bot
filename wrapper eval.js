'use strict';
const Discord = require('discord.js');
function run(command){
	let wrapper = undefined;
	let process = undefined;
	let require = undefined;
	let module = undefined;
	eval(command);
	return 0;
}
if(process.argv[3] === 'ADMIN'){
	process.on('message', include => {
		eval(process.argv[2]);
	});
}
else{
	run(process.argv[2]);
}