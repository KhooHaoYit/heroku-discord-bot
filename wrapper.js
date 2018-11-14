'use strict';
function output(a){console.log(a);}
function wrapper(command, include){
	let console = {
		buffer: '',
		log: (input) => console['buffer'] += (input + '\n')
	}
	let wrapper = undefined;
	let process = undefined;
	let require = undefined;
	let module = undefined;
	try {
		//setTimeout(2000, () => throw 'Timeout.');
		output('Before');
		eval(command);
		output('After');
		return console.buffer;
	} catch (e) {
		return e;
	}
}

module.exports = {
	eval: wrapper,
	console: console
}