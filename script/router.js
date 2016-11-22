var fs = require("fs");

var logger = require("./logger");
var users = require("./users");
var qry = require("querystring");

function uid(s) {
	if (s.lastIndexOf(';') < 0) {
		return null;
	}

	var uidKV = s.substring(s.lastIndexOf(';') + 1);
	var key = uidKV.split('=')[0];
	var uid = uidKV.split('=')[1];
	return uid;
}

function route(handler, pathname, request, response) {

	if (pathname.startsWith("/css") || pathname.startsWith("/js")) {		
		fs.readFile("." + pathname, "binary", function(error, file) {
		if (error) {
			response.writeHead(500, {"Content-Type":"text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			if (pathname.startsWith("/css")) {
				response.writeHead(200, {"Content-Type":"text/css"});
			} else {
				response.writeHead(200, {"Content-Type":"text/javascript"});
			}
			response.write(file, "binary");
			response.end();
		}
		});
		return;
	}

	if (pathname == "/"){
		pathname = "/index";
	} else if (pathname == "/home"){
	} else if (!uid(pathname)) {
		response.writeHead(307, {"Location":"/"});
		response.end();
		return;		
	}	

	logger.info("route a request for " + pathname + ", audit[" + request.socket.remoteAddress + ": " + pathname + "]");

	var id=  uid(pathname);
	request.uid =  id;
	request.username = users.userManager.getUsernameByUid(id);	

	if (pathname.lastIndexOf(';') >= 0) {
		pathname= pathname.substring(0, pathname.lastIndexOf(';'));		
	}

	if (typeof handler[pathname] === 'function') {
		return handler[pathname](request, response);
	} else {
		logger.err("no request handler found for " + pathname);
		response.writeHead(200, {"Content-Type":"text/plain"});
		response.write("404 Not Found");
		response.end();
	}
}

exports.route = route;