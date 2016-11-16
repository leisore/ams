var server = require("./server");
var router = require("./router");
var logger = require("./logger");
var handers = require("./handlers");

var handler = {
	"/manager": handers.managerAction.default,
	"/manager/upload": handers.managerAction.upload,
	"/manager/summary": handers.managerAction.summary,

	"/employee": handers.employeeAction.default,
	"/employee/details": handers.employeeAction.attendDetails,
	"/employee/confirm": handers.employeeAction.attendConfirm,
};

server.start(router.route, handler);
