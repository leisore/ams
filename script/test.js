/*

var s="/employee/index;uid=123344";

function uid(path) {
	if (s.lastIndexOf(';') < 0) {
		return null;
	}

	var uidKV = s.substring(s.lastIndexOf(';') + 1);
	var key = uidKV.split('=')[0];
	var uid = uidKV.split('=')[1];
	return uid;
}

console.log(uid(s));
console.log(uid(''));
console.log(uid('/'));
console.log(uid('/;'));

const crypto = require("crypto");
const id = crypto.randomBytes(16).toString("hex");
console.log(id); // => f9b327e70bbcf42494ccb28b2d98e00e

*/



var fs = require('fs');

var history = [];
fs.readdir("F:/study/javascript/ams/upload2", function(err, files) {
	if (!err) {
		var parsed = files.filter(function(v){
			return v.endsWith('.parsed');
		});
		parsed.forEach(function(v) {
			history.push(v.substring(0, v.indexOf('.')));
		});
	} else {
		console.log(err);
	}
	history.forEach(v => console.log(v));	
});
