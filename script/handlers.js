var fs = require('fs');
var qry = require("querystring");
var url = require("url");
var util = require('util');

var iconv = require('./node-modules/iconv-lite');
var formidable = require('./node-modules/formidable');

var parser = require('./parser.js');
var tools = require('./tools.js');
var logger = require('./logger.js');

var managerAction = {
	default: function(request, response) {
		var date = new Date();
		var year = date.getFullYear();
		var current = date.getMonth() + 1;	
		var last = current - 1;

		if (current < 10) current = "0" + current;
		if (last < 10) last = "0" + last;

		var content = '\
			<html> \
				<head> \
					<meta charset="utf-8"/> \
					<title>BES考勤辅助系统</title> \
				</head> \
				<body> \
					请选择操作：<ol>\
					<li>请选择考勤月份进行查看：\
					<a href="/manager/summary?date=' + (year + "" + current) + '">本月</a> \
					<a href="/manager/summary?date=' + (year + "" + last) + '">上月</a><br> </li>\
					<li>上传考勤记录:\
					<form action="/manager/upload" enctype="multipart/form-data" method="post">\
						<input type="file" name="upload" title="upload2"/><br>\
						<input type="submit" value="上传"/>\
					</form></li>\
			</body></html>';
		response.writeHead(200);
		response.write(content);
		response.end();				
	},

	summary: function(request, response) {
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
			</head> \
			<body>';
		response.write(start);

		var meal = '\
				加班饭补单:<br> \
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
			for (var i = 0; i < items.length; i++) {
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
				<br><br>加班单:<br> \
				<table id="table1"> \
					<tr> \
						<th>名字</th> \
						<th>加班日期</th> \
						<th>是否周末</th> \
						<th>加班时间</th> \
						<th>加班事由</th> \
					</tr>';
		response.write(overtime);

		for (var [k,v] of workSheet) {
			var items = v;				
			for (var i = 0; i < items.length; i++) {
				if (items[i].workType == 2) {
					var row = '\
						<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
							<td>' + k + '</td> \
							<td>' + items[i].date + '</td> \
							<td>' + tools.getWeekdayLabel(items[i].date, true) + '</td> \
							<td>' + tools.getOvertimeStart(items[i].date, items[i].checkInTime) + '~' + items[i].checkOutTime + '</td> \
							<td>'+ items[i].workReason  +'</td> \
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
			logger.debug(util.inspect({fields: fields, files:files}))		

			var uploadPath = "./upload/" + files.upload.name;

			var src = fs.createReadStream(files.upload.path);
			var dst = fs.createWriteStream(uploadPath);
			src.pipe(dst);

			response.writeHead(200, {"Content-Type":"text/html", "charset":"UTF-8"});
			response.write('<html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"/></head><body>上传考勤记录内容如下：<a href="/manager">返回</a><br><pre>');
			fs.readFile(uploadPath, (err, data) => {
				if (err) {
					response.write(util.inspec(err));
				} else {				
					response.write(iconv.decode(data, "gbk"));
				}
				response.write("</pre></body></html>");

				response.write("<br>解析后内容如下：<br><pre>");
				var workSheet = parser.parse(uploadPath);
				var json = tools.map2json(workSheet);
				fs.writeFileSync(uploadPath+".parsed", json);
				response.write(json);
				response.end();
			});
		});
	}
};

var employeeAction = {
	default: function(request, response) {
		var date = new Date();
		var year = date.getFullYear();
		var current = date.getMonth() + 1;	
		var last = current - 1;

		if (current < 10) current = "0" + current;
		if (last < 10) last = "0" + last;

		var start = '\
			<html> \
				<head> \
					<meta charset="utf-8"/> \
					<title>BES考勤辅助系统</title> \
				</head> \
				<body> \
					请选择自己的考勤月份：<br>';
		var list = "";
		for (var name of tools.employees()) {
			list +=  tools.spellName2CnName(name) + '：<a href="/employee/details?name='+ name +'&date=' + (year + "" + current) + '">本月</a>';
			list +=                                 '  <a href="/employee/details?name='+ name +'&date=' + (year + "" + last) + '">上月</a><br>';
		}			
		var end	='</body></html>';
		response.writeHead(200);
		response.write(start);
		response.write(list);
		response.write(end);
		response.end();			
	},

	attendDetails: function(request, response) {
		var query = qry.parse(url.parse(request.url).query);
		var name = query["name"];
		var date = query["date"];

		var path = "./upload/" + date + ".txt.parsed";
		if (fs.existsSync(path)) {
			
			response.writeHead(200);

			var workSheet = tools.json2map(fs.readFileSync(path));			
			var items = workSheet.get(tools.spellName2CnName(name));
			var start = '\
				<html> \
				<head> \
					<meta charset="utf-8"/> \
					<title>BES考勤辅助系统</title> \
					<link rel="stylesheet" type="text/css" href="/css/style.css" />\
				</head> \
				<body> \
					<form action="/employee/confirm" method="get"> \
					<input type="hidden" name="name" value="' + name +'" />\
					<input type="hidden" name="date" value="' + date +'" />\
					' + tools.spellName2CnName(name) +' \
					<button type="submit" name="btn_confirm">确认</button>\
					<table id="table1"> \
						<tr> \
							<th>日期</th> \
							<th>星期</th> \
							<th>签到时间</th> \
							<th>签退时间</th> \
							<th>类型</th> \
							<th>加班事由</th> \
						</tr>';
			
			response.write(start);
			
			for (var i = 0; i < items.length; i++) {
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
					response.write(row);
			}

			var end = '</table></form></body> </html>';
			response.write(end);
			response.end();	
		} else {
			var content = '\
					<html> \
						<head> \
							<meta charset="utf-8"/> \
							<title>BES考勤辅助系统</title> \
						</head> \
						<body> \
							未发现考勤数据，请联系考勤管理人员上传考勤数据。\
						</body> \
				</html>';
			response.writeHead(200);
			response.write(content);
			response.end();			
		}
	},
	
	attendResult: function(request, response) {

		var query = qry.parse(url.parse(request.url).query);
		var name = query["name"];
		var date = query["date"];

		var path = "./upload/" + date + ".txt.parsed";
		var workSheet = tools.json2map(fs.readFileSync(path));			
		var items = workSheet.get(tools.spellName2CnName(name));

		response.writeHead(200);

		var start = '\
			<html> \
			<head> \
				<meta charset="utf-8"/> \
				<title>BES考勤辅助系统</title> \
				<link rel="stylesheet" type="text/css" href="/css/style.css" />\
			</head> \
			<body> \
				'+ tools.spellName2CnName(name) +'<br>';
		response.write(start);

		var meal = '\
				<br>加班饭补单:<br> \
				<table id="table1"> \
					<tr> \
						<th>日期</th> \
						<th>签到时间</th> \
						<th>签退时间</th> \
						<th>是否领取饭补</th> \
					</tr>';
		response.write(meal);
		
		
		for (var i = 0; i < items.length; i++) {
			if (items[i].workType == 1) {
				var row = '\
					<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
						<td>' + items[i].date + '</td> \
						<td>' + items[i].checkInTime + '</td> \
						<td>' + items[i].checkOutTime + '</td> \
						<td>是</td> \
					</tr>';
				response.write(row);
			}
		}
		response.write('</table>');
		
		var overtime = '\
				<br>加班单:<br> \
				<table id="table1"> \
					<tr> \
						<th>加班日期</th> \
						<th>是否周末</th> \
						<th>加班时间</th> \
						<th>加班事由</th> \
					</tr>';
		response.write(overtime);
					
		for (var i = 0; i < items.length; i++) {
			if (items[i].workType == 2) {
				var row = '\
					<tr ' + (!tools.isWorkDay(items[i].date) ? 'class="nonWorkDay"' : "") + '> \
						<td>' + items[i].date + '</td> \
							<td>' + tools.getWeekdayLabel(items[i].date, true) + '</td> \
							<td>' + tools.getOvertimeStart(items[i].date, items[i].checkInTime) + '~' + items[i].checkOutTime + '</td> \
						<td>'+ items[i].workReason  +'</td> \
					</tr>';
				response.write(row);
			}
		}
		var end = '</table></body> </html>';
		response.write(end);
		response.end();	
	},

	attendConfirm: function(request, response) {
		var query = qry.parse(url.parse(request.url).query);
		var name = query["name"];
		var date = query["date"];

		var path = "./upload/" + date + ".txt.parsed";
		var workSheet = tools.json2map(fs.readFileSync(path));			
		var items = workSheet.get(tools.spellName2CnName(name));

		for (var i = 0; i < items.length; i++) {
			items[i].workType = query["d" + i];
			items[i].workReason = query["r" + i]
		}
		fs.writeFileSync(path, tools.map2json(workSheet));

		employeeAction.attendResult(request, response);
	}
};

exports.managerAction = managerAction;
exports.employeeAction = employeeAction;
