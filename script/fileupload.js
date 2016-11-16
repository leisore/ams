var formidable = require('formidable'),
	http = require('http'),
	util = require('util');

http.createServer(function(request, response) {
	if (request.url == '/upload' && request.method.toLowerCase() == 'post') {
		var form = new formidable.IncomingForm();
		form.parse(request, function(err, fields, files) {
			response.writeHead(200, {'content-type':'text/plain'});
			response.write('received upload request:');
			response.write(util.inspect({fields: fields, files:files}));
			response.end();
		});
		return;
	}
	response.writeHead(200, {'content-type':'text/html'});
	response.end(
		'<html><body>\
			<form action="/upload" enctype="multipart/form-data" method="post">\
			<input type="text" name="title"/><br>\
			<input type="file" name="upload" mulitple="multiple"/><br>\
			<input type="submit" value="upload"/>\
			</form>\
			</body></html>\
		'
		);
}).listen(8888);	