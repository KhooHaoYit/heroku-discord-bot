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
run(process.argv[2]);