var http = require("http");
var url = require("url");
var logger = require("./logger");

function start(route, handler) {

	function onRequest(request, response){
		var pathname = url.parse(request.url).pathname;
		logger.info("request for "  + pathname + " received.");

		//request.setEncoding("utf8");
		route(handler, pathname, request, response);	
	};

	http.createServer(onRequest).listen(8888);	
	logger.info("http server has started");
}

exports.start = start;
