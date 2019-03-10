'use strict';
const API = {
	wait: [],
	avable: ['MessageContent', 'MessageId']
};
API.get = function(data){
	let append = API.wait.findIndex(element => {
		return element === undefined;
	});
	if(append == -1){
		append = API.wait.length;
	}
	const promise = new Promise((resolve, reject) => {
		API.wait[append] = { resolve: resolve, reject: reject };
	});
	process.send({ data: data, id: append });
	return promise;
}
process.on('message', (message) => {
	API.wait[message.id].resolve(message.data);
	API.wait[message.id] = undefined;
});
async function run(command){
	let returned;
	try{
		returned = await (async () => {}).constructor('API', command)(API);
	}
	catch(e){
		console.error(e.stack);
	}
	process.exit();
}
run(process.argv[2]);