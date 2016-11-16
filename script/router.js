var fs = require("fs");

var logger = require("./logger");

function route(handler, pathname, request, response) {
	logger.info("route a request for " + pathname + ", audit[" + request.socket.address().address + " " + request.url + "]");
	if (typeof handler[pathname] === 'function') {
		return handler[pathname](request, response);
	} else if (pathname.startsWith("/css")) {		
		fs.readFile("." + pathname, "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {"Content-Type":"text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type":"text/plain"});
			response.write(file, "binary");
			response.end();
		}
		});
	} else {
		logger.err("no request handler found for " + pathname);
		response.writeHead(200, {"Content-Type":"text/plain"});
		response.write("404 Not Found");
		response.end();
	}
}

exports.route = route;