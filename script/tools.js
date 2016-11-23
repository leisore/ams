var fs = require('fs');

var LegalHoliday = JSON.parse(fs.readFileSync("./config/LegalHoliday.json"));
var UserNameMap = new Map(JSON.parse(fs.readFileSync("./config/Employee.json")));

function cnName2SpellName(cnName) {
    return UserNameMap.get(cnName);
}

function spellName2CnName(spellName) {
    for (var [k,v] of UserNameMap) {
        if (spellName == v) {
            return k;
        }
    }
    return "unkown";
}

function employees() {
    var lst = [];
     for (var [k,v] of UserNameMap) {
        lst.push(v);
    }
    lst.sort();
    return lst;
}

function getCnWeekDay(ymd) {
    var date = new Date(ymd.split("/")[0], ymd.split("/")[1]-1, ymd.split("/")[2]);
    switch (date.getDay()) {
        case 0:
            return '星期日';
            break;
        case 1:
            return '星期一';
            break;
        case 2:
            return '星期二';
            break;
        case 3:
            return '星期三';
            break;
        case 4:
            return '星期四';
            break;
        case 5:
            return '星期五';
            break;
        case 6:
            return '星期六';
            break;                                                                   
        default:
            return "unkown";
            break;
    }
}

function isWeekend(ymd) {
    var date = new Date(ymd.split("/")[0], ymd.split("/")[1]-1, ymd.split("/")[2]);
    return date.getDay() ==0 || date.getDay() ==6; 
}

function isHoliday(ymd) {
    return LegalHoliday[ymd.substring(0,7)] && LegalHoliday[ymd.substring(0,7)]["Holiday"].includes(ymd);
}

function isHoliWorkday(ymd) {
    return LegalHoliday[ymd.substring(0,7)] && LegalHoliday[ymd.substring(0,7)]["WorkDay"].includes(ymd);
}

function isWorkDay(ymd) {
    return isHoliWorkday(ymd) || (!isHoliday(ymd) && !isWeekend(ymd)) ;
}

function getWeekdayLabel(ymd, ignoreNormal) {
    if (isHoliday(ymd)) {
        return getCnWeekDay(ymd)+"(法定假日)";
    } else if (isHoliWorkday(ymd)) {
        return getCnWeekDay(ymd)+"(法定补假)";
    } else if (isWeekend(ymd)) {
        return getCnWeekDay(ymd);
    } else if (ignoreNormal) {
        return "";
    } else {
        return getCnWeekDay(ymd);
    }
}

function getOvertimeStart(ymd, srcCheckinTime) {
    if (isHoliday(ymd)) {
        return srcCheckinTime;
    } else if (isHoliWorkday(ymd)) {
        return "19:30";
    } else if (isWeekend(ymd)) {
        return srcCheckinTime;
    } else {
        return "19:30";
    }
}

function map2json(map) {
    return JSON.stringify([...map], null, "    ");
}

function json2map(json) {
    return new Map(JSON.parse(json));
}

function md5(s) {
    var crypto = require('crypto');
    return crypto.createHash('md5').update(s).digest("hex");
}

function uid() {
    crypto = require("crypto");
    uid = crypto.randomBytes(16).toString("hex");
    return uid;
}

exports.employees = employees;
exports.cnName2SpellName = cnName2SpellName;
exports.spellName2CnName = spellName2CnName;
exports.map2json = map2json;
exports.json2map = json2map;
exports.getCnWeekDay = getCnWeekDay;
exports.isWeekend = isWeekend;
exports.isHoliday = isHoliday;
exports.isHoliWorkday = isHoliWorkday;
exports.isWorkDay = isWorkDay; 
exports.getWeekdayLabel = getWeekdayLabel;
exports.getOvertimeStart = getOvertimeStart;
exports.md5 = md5;
exports.uid = uid;
 
