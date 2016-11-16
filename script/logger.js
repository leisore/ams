
function now() {
	return new Date().toISOString();
}

function info(msg) {
	console.info(now() + " INFO " + msg);
}

function err(msg) {
	console.info(now() + " ERROR " + msg);
}

function debug(msg) {
	console.info(now() + " DEBUG " + msg);
}


exports.info = info;
exports.err = err;
exports.debug = debug;
