module.exports.RemoveMatched = function(data, ...regex){
	for(let remain = regex.length; remain; data.replace(regex[--remain], '')){}
}
module.exports.U64ToString = function(string){
	if(typeof string !== 'string')
		return undefined;
	const temp = new Uint16Array(4);
	(new BigUint64Array(temp.buffer))[0] = BigInt(string);
	const f = String.fromCharCode;
	return f(temp[0]) + f(temp[1]) + f(temp[2]) + f(temp[3]);
}
module.exports.StringToU64 = function(string){
	if(typeof string !== 'string')
		return undefined;
	const temp = new Uint16Array(4);
	temp[0] = string.charCodeAt(0);
	temp[1] = string.charCodeAt(1);
	temp[2] = string.charCodeAt(2);
	temp[3] = string.charCodeAt(3);
	return (new BigUint64Array(temp.buffer))[0].toString();
}
module.exports.GNB = function(number){
	if(number){
		let at = 1;
		while(at < Number.MAX_SAFE_INTEGER){
			if(number & at){
				return at;
			}
			at *= 2;
		}
	}
	return null;
}
function XORstring(a, b){
	let output = '';
	for(let remain = a.length > b.length ? a.length : b.length; remain; ){
		--remain;
		output = String.fromCharCode(a.charCodeAt(remain) ^ b.charCodeAt(remain)) + output;
	}
	return output;
}