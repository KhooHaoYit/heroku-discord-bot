const http = require('http');

http.createServer((req, res) => {
	console.log(req.connection.remoteAddress);
	res.writeHead(301, {'Location': process.env.REDIRECT || 'http://121.123.97.217'});
	res.end();
}).listen(process.env.PORT || 3000);