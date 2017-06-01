var fs = require('fs');
var url = require("url");
var util = require('util');
var qry = require("querystring");

var iconv = require('./node-modules/iconv-lite');
var formidable = require('./node-modules/formidable');

var parser = require('./parser.js');
var tools = require('./tools.js');
var logger = require('./logger.js');
var users = require('./users.js');

users.userManager.loadUsers();

var managerAction = {
	history: function(request, response) {
		fs.readdir("./upload/", function(err, files) {
			if (!err) {
				response.writeHead(200);
				if (files.length == 0) {
					response.write('没有发现报表数据！');	
				} else {				
					response.write('<div id="employeeInfo">');
					files.filter(v => {return v.endsWith('.parsed')}).forEach(v => {
						var ym = v.substring(0, v.indexOf('.'));
						response.write('<a href="#">' + ym + '</a>&nbsp;&nbsp;&nbsp;&nbsp;');
					});	
				}	
			} else {
				response.writeHead(500);
				response.write(util.inspect(err));
				logger.err(util.inspect(err));
			}
			response.end();
		});
	},

	report: function(request, response) {
		var query = qry.parse(url.parse(request.url).query);
		var date = query["date"];

		var path = "./upload/" + date + ".txt.parsed";
		var workSheet = tools.json2map(fs.readFileSync(path));	

		response.writeHead(200);

		var start = '\
			<html> \
			<head> \
				<meta charset="utf-8"/> \
				<title>BES考勤辅助系统</title> \
				<link rel="stylesheet" type="text/css" href="/css/style.css" />\
				<link rel="stylesheet" media="print" type="text/css" href="/css/print.css" />\
			</head> \
			<body>';
		response.write(start);

		var meal = '\
				<p>年月：' + date + '</p>\
				<p>加班饭补单:</p> \
				<table id="table1"> \
					<tr> \
						<th>名字</th> \
						<th>日期</th> \
						<th>是否周末</th> \
						<th>签到时间</th> \
						<th>签退时间</th> \
						<th>是否领取饭补</th> \
					</tr>';
		response.write(meal);
		
		for (var [k,v] of workSheet) {
			var items = v;
			for (var i = 0; items && (i < items.length); i++) {
				if (items[i].workType == 1) {
					var row = '\
						<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
							<td>' + k + '</td> \
							<td>' + items[i].date + '</td> \
							<td>' + tools.getWeekdayLabel(items[i].date, true) + '</td> \
							<td>' + items[i].checkInTime + '</td> \
							<td>' + items[i].checkOutTime + '</td> \
							<td>是</td> \
						</tr>';
					response.write(row);
				}
			}		
		}	

		response.write('</table>');
		
		var overtime = '\
				<p>加班单:</p> \
				<table id="table1"> \
					<tr> \
						<th>名字</th> \
						<th>加班日期</th> \
						<th>是否周末</th> \
						<th>加班时间</th> \
						<th>加班事由</th> \
						<th>备注</th> \
					</tr>';
		response.write(overtime);

		for (var [k,v] of workSheet) {
			var items = v;				
			for (var i = 0; items && (i < items.length); i++) {
				if (items[i].workType == 2) {
					var row = '\
						<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
							<td>' + k + '</td> \
							<td>' + items[i].date + '</td> \
							<td>' + tools.getWeekdayLabel(items[i].date, true) + '</td> \
							<td>' + tools.getOvertimeStart(items[i].date, items[i].checkInTime) + '~' + items[i].checkOutTime + '</td> \
							<td>'+ items[i].workReason  +'</td> \
							<td></td> \
						</tr>';
					response.write(row);
				}
			}
		}		
		var end = '</table></body> </html>';
		response.write(end);
		response.end();	
	},

	upload: function(request, response) {
		var form = new formidable.IncomingForm();
		form.parse(request, function(error, fields, files){
			if (error) {
				logger.err(error);
				response.writeHead(500);
				response.write("上传失败！");
				response.end();
				return;
			}
			logger.debug(util.inspect({fields: fields, files:files}))		

			var uploadPath = "./upload/" + files.upload.name;

			var src = fs.createReadStream(files.upload.path);
			var dst = fs.createWriteStream(uploadPath);
			src.pipe(dst);

			response.writeHead(200);
			response.write('上传考勤记录内容如下：<br><pre>');
			fs.readFile(uploadPath, (err, data) => {
				if (err) {
					response.write(util.inspec(err));
				} else {				
					response.write(iconv.decode(data, "gbk"));
				}
				response.write("</pre>");

				response.write("<br>解析后内容如下：<br><pre>");
				var workSheet = parser.parse(uploadPath);
				var json = tools.map2json(workSheet);
				fs.writeFileSync(uploadPath+".parsed", json);
				response.write(json);
				response.write("</pre>");
				response.end();
			});
		});
	}
};

var employeeAction = {
	current: function(request, response) {
		var date = new Date();
		var year = date.getFullYear();
		var current = date.getMonth() + 1;	
		var last = current - 1;
		//var last = current;

		if (current < 10) current = "0" + current;
		if (last < 10) last = "0" + last;
		var name = request.username;
		var path = "./upload/" + year + "" + last + ".txt.parsed";
		var content = "<h1>当前没有考勤数据！</h1>";
		if (fs.existsSync(path)) {			
			var workSheet = tools.json2map(fs.readFileSync(path));			
			var items = workSheet.get(tools.spellName2CnName(name));
			content = '<div id="employeeInfo">姓名：&nbsp;' + tools.spellName2CnName(name) + '&nbsp;&nbsp;&nbsp;&nbsp;年月：&nbsp;' + (year+"/"+last) + '&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" id="currentCommit">提交</a></div>'; 
			content += '\
					<form id="employeeCurrentForm" action="/employee/confirm;uid='+ request.uid + '?date='+ year + '' + last+ '">\
					<table id="table1"> \
						<tr> \
							<th>日期</th> \
							<th>星期</th> \
							<th>签到时间</th> \
							<th>签退时间</th> \
							<th>类型</th> \
							<th>加班事由</th> \
						</tr>';			
			
			for (var i = 0; items && (i < items.length); i++) {
				var row = '\
						<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
							<td>' + items[i].date + '</td> \
							<td>' + tools.getWeekdayLabel(items[i].date) + '</td> \
							<td>' + items[i].checkInTime + '</td> \
							<td>' + items[i].checkOutTime + '</td> \
							<td> \
								<input type=radio name="d' + i + '" value="0"' + (items[i].workType == "0" ? 'checked="checked"' : "") + ' >无</input> \
								<input type=radio name="d' + i + '" value="1"' + (items[i].workType == "1" ? 'checked="checked"' : "") + ' >饭补</input> \
								<input type=radio name="d' + i + '" value="2"' + (items[i].workType == "2" ? 'checked="checked"' : "") + ' >加班</input> \
							</td> \
							<td><input id="reason" type="text" name="r' + i + '" value="' + items[i].workReason + '" /></td> \
						</tr>';
						content += row;
			}

			content += '</table></form><div id="employeeInfo2">姓名：&nbsp;' + tools.spellName2CnName(name) + '&nbsp;&nbsp;&nbsp;&nbsp;年月：&nbsp;' + (year+"/"+last) + '&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" id="currentCommit2">提交</a></div>';;
		}
		response.writeHead(200);
		response.write(content);
		response.end();			
	},
	
	attendResult: function(request, response) {
		var query = qry.parse(url.parse(request.url).query);
		var date = query["date"];

		var uid = request.uid;
		var name = users.userManager.getUsernameByUid(uid);		

		var path = "./upload/" + date + ".txt.parsed";
		var workSheet = tools.json2map(fs.readFileSync(path));			
		var items = workSheet.get(tools.spellName2CnName(name));

		response.writeHead(200);

		var content = '\
				<div id="employeeInfo">姓名：&nbsp;' + tools.spellName2CnName(name) + '&nbsp;&nbsp;&nbsp;&nbsp;年月：&nbsp;' + date + '</div>\
				<p>加班饭补单:</p> \
				<table id="table1"> \
					<tr> \
						<th>日期</th> \
						<th>签到时间</th> \
						<th>签退时间</th> \
						<th>是否领取饭补</th> \
					</tr>';		
		
		for (var i = 0; items && (i < items.length); i++) {
			if (items[i].workType == 1) {
				content += '\
					<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
						<td>' + items[i].date + '</td> \
						<td>' + items[i].checkInTime + '</td> \
						<td>' + items[i].checkOutTime + '</td> \
						<td>是</td> \
					</tr>';
			}
		}
		content += '</table>';
		
		content += '\
				<br>加班单:<br> \
				<table id="table1"> \
					<tr> \
						<th>加班日期</th> \
						<th>是否周末</th> \
						<th>加班时间</th> \
						<th>加班事由</th> \
					</tr>';
					
		for (var i = 0; items && (i < items.length); i++) {
			if (items[i].workType == 2) {
				content += '\
					<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
						<td>' + items[i].date + '</td> \
							<td>' + tools.getWeekdayLabel(items[i].date, true) + '</td> \
							<td>' + tools.getOvertimeStart(items[i].date, items[i].checkInTime) + '~' + items[i].checkOutTime + '</td> \
						<td>'+ items[i].workReason  +'</td> \
					</tr>';
			}
		}
		content += '</table>';
		response.write(content);
		response.end();	
	},

	attendConfirm: function(request, response) {
		var query = qry.parse(url.parse(request.url).query);
		var date = query["date"];

		var uid = request.uid;
		var name = users.userManager.getUsernameByUid(uid);

		var path = "./upload/" + date + ".txt.parsed";
		var workSheet = tools.json2map(fs.readFileSync(path));			
		var items = workSheet.get(tools.spellName2CnName(name));

		for (var i = 0; items && (i < items.length); i++) {
			items[i].workType = query["d" + i];
			items[i].workReason = query["r" + i]
		}
		fs.writeFileSync(path, tools.map2json(workSheet));

		employeeAction.attendResult(request, response);
	},

	attendHistory: function(request, response) {
		fs.readdir("./upload", function(err, files) {
			if (!err) {
				response.writeHead(200);
				if (files.length == 0) {
					response.write('没有发现历史数据！');	
				} else {
					response.write('<div id="employeeInfo">');
					files.filter(v => {return v.endsWith('.parsed')}).forEach(v => {
						var ym = v.substring(0, v.indexOf('.'));
						response.write('<a href="#">' + ym + '</a>&nbsp;&nbsp;&nbsp;&nbsp;');
					});	
				}		
			} else {
				response.writeHead(500);
				response.write(util.inspect(err));
				logger.err(util.inspect(err));
			}
			response.end();
		});
	},

	historyDetails: function(request, response) {
		employeeAction.attendResult(request, response);
	},

	changePassword: function(request, response) {
		var query = qry.parse(url.parse(request.url).query);
		var newP = query["newPassword"];

		var uid = request.uid;
		var name = users.userManager.getUsernameByUid(uid);

		users.userManager.updateUser(name, newP, users.userManager.isAdmin(uid));

		response.writeHead(307, {"Location":"/"});
		response.end();
		return;	
	}
};

function index(request, response, username, password, isError) {
	if (!username) username = "";
	if (!password) password = "";
	if (isError==null || isError==undefined) isError = false; 

	var head = '\
		<html>\
			<head>\
  				<meta charset="utf-8">\
  				<title>BES考勤辅助系统</title>\
  				<link rel="stylesheet" type="text/css" href="/css/standardize.css">\
  				<link rel="stylesheet" type="text/css" href="/css/login-grid.css">\
  				<link rel="stylesheet" type="text/css" href="/css/login.css">\
		</head>\
	';

	var body = '\
		<body class="body page-index clearfix">\
		<form action="/home" method="post">\
	  		<p class="text text-1">BES考勤辅助系统</p>\
	  		<div class="container clearfix">\
				<p class="text text-2">用户名</p>\
				<input class="_input _input-1" name="username" type="text" value="' + username + '"></input>\
				<p class="text text-3">密 &nbsp; 码</p>\
				<input class="_input _input-2" name="password" type="password" value="' + password + '"></input>\
	  		</div>\
	  		' + (isError ? '<p id="err" class="text text-4">用户名或密码错误！</p>' : '') + '\
	  		<button id="btLogin" class="_button" type="submit">登 &nbsp; 录</button>\
		</form>\
		</body>\
	';
	var end = '\
		</html>\
	';

	response.writeHead(200, {"Content-Type":"text/html"});
	response.write(head);
	response.write(body);
	response.write(end);
	response.end();
}

function home(request, response) {
	var postData= "";
	request.addListener("data", function(postDataChunk) {
		postData += postDataChunk;		
    });
    request.addListener("end", function() {
      	var query = qry.parse(postData);
		var username = query["username"];
		var password = query["password"];
		logger.info("user " + username + " login");

		if (users.userManager.isValidUser(username,password)) {
			var uid = users.userManager.loginUser(username);
			var content = '\
				<html>\
					<head>\
  						<meta charset="utf-8">\
  						<title>BES考勤辅助系统</title>\
  						<link rel="stylesheet" href="css/standardize.css">\
  						<link rel="stylesheet" href="css/employee-grid.css">\
  						<link rel="stylesheet" href="css/employee.css">\
  						<link rel="stylesheet" href="css/style.css">\
  						<script type="text/javascript" src="js/base.js"></script>\
				</head>\
				<body class="body page-employee clearfix">\
  					<div class="container container-1 clearfix">\
    					<p class="text">BES考勤辅助系统</p>\
  					</div>\
  					<div class="container _element"></div>\
  					<p class="text text-2">考勤</p>\
  					<p class="text text-3"><a href="#" id="employeeCurrent">当前考勤</a></p>\
  					<p class="text text-4"><a href="#" id="employeeHistory">历史考勤</a></p>\
  					<p class="text text-5">设置</p>\
  					<p class="text text-6"><a href="#" id="changePassword">修改密码</a></p>\
					<p class="text text-7"><a href="#" id="logout">退 &nbsp; &nbsp; &nbsp;出</p>\
					<div style="display:' + (users.userManager.isAdmin(uid) ? "block" : "none") + '">\
					<p class="text text-8">管理</p>\
					<p class="text text-9"><a href="#" id="managerUpload">上传考勤</a></p>\
					<p class="text text-10"><a href="#" id="managerReport">考勤报表</a></p>\
					</div>\
  					<div class="container container-3" id="mainFrame">\
  					</div>\
					<input type="text" id ="uid" value="' + uid + '" hidden="true"></input>\
				</body>\
			</html>\
			';
			response.writeHead(200, {"Content-Type":"text/html"});
			response.write(content);
			response.end();	
		} else {
			index(request, response, username, password, true);
		}		
		return;
    });
}

exports.index = index;
exports.home = home;
exports.managerAction = managerAction;
exports.employeeAction = employeeAction;
