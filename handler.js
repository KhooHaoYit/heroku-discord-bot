function DecodeURL(URL){
	let args = URL.split('/');
	switch(args[3]){
		case 'avatars':
			return {
				user: args[4]
			}
		case 'emojis':
			return {
				emoji: args[4].split('.')[0]
			}
		case 'channels':
			return {
				guild: args[4],
				channel: args[5],
				message: args[6]
			}
		case 'attachments':
			return {
				channel: args[4],
				message: args[5]
			}
		default:
			return null;
	}
}

function GetUser(input, message, client){
	let args = input.split(' ');
	switch(args.length){
		case 1:
			if(/^\d+$/.test(args[0])){
				return client.users[args[0]];
			}
			else{
				let decoded = DecodeURL(args[0]);
				if(decoded.user){
					return client.users[decoded.user];
				}
			}
			break;
		default:
	}
	return null;
}

module.exports = {
	
}