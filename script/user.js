var date = new Date("2016/10/27".split("/")[0], "2016/10/27".split("/")[1]-1, "2016/10/27".split("/")[2]);
console.log(date);
console.log(date.getDay());

var map = new Map();
map.set('lee', {name:123});


function map2json(map) {
    return JSON.stringify([...map]);
}

function json2map(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}

console.log(map2json(map));

map = json2map(map2json(map));
console.log(map);

date = new Date();
console.log(date.getFullYear());
console.log(date.getMonth());

var a = [1,2,3];
for (var i of a) {
console.log(i);
}

var LegalHoliday = {
	"2016/10":{


	"Holiday": [
		"20161001",
		"20161002",
		"20161003",
		"20161004",
		"20161005",
		"20161006",
		"20161007"
	],
	"WorkDay":[
		"20161008",
		"20161009"
	]
	}
};

console.log(LegalHoliday["2016/10/09".substring(0,7)]);
console.log(LegalHoliday["2016/10/09".substring(0,7)]["Holiday"].includes("20161005"));


var fs = require('fs');

var convertorMap = new Map(
    [
        ["李超鹏", "lichaopeng"],
        ["丁龙龙", "dinglonglong"],
        ["黄飞虎", "huangfeihu"],
        ["孙超虎", "sunchaohu"],
        ["邓哲", "dengzhe"],
        ["龙维", "longwei"],
        ["刘娴", "liuxian"],
        ["蒋慧", "jianghui"],
        ["伍萌萌", "wumengmeng"],
        ["李静男", "lijingnan"],
        ["王少宁", "wangshaoning"]
    ]
); 

//fs.writeFileSync("./LegalHoliday.txt",JSON.stringify(LegalHoliday, null, "    "));
//fs.writeFileSync("./Employee.txt",JSON.stringify([...convertorMap], null, "    "));


