var server = require("./server");
var router = require("./router");
var logger = require("./logger");
var handers = require("./handlers");

var handler = {
	"/index": handers.index,
	"/home": handers.home,

	"/manager/upload": handers.managerAction.upload,
	"/manager/report": handers.managerAction.report,
	"/manager/history": handers.managerAction.history,

	"/employee/current": handers.employeeAction.current,
	"/employee/confirm": handers.employeeAction.attendConfirm,
	"/employee/history": handers.employeeAction.attendHistory,
	"/employee/historyDetails": handers.employeeAction.historyDetails,

	"/employee/changePassword": handers.employeeAction.changePassword,
};

server.start(router.route, handler);