var fs = require('fs');
var util = require('util');

var iconv = require('./node-modules/iconv-lite');

var logger = require('./logger.js');
var tools = require('./tools.js');

function parse(path) {
    //var buf = iconv.encode(iconv.decode(fs.readFileSync(path), "gbk"), "utf-8");
    var buf = (fs.readFileSync(path));
    logger.debug("===" + buf.length);

    var metNonSpace, metLF, metCR, firstLine = true;
    var start = 0, len = 0,  size = buf.length;
    var index = [];
    var offset = 0;

    while (len < size) {            
        switch(buf[len]) {
            case 10:
                firstLine = false;
                metLF = true;                       
                break;               
            case 13:
                firstLine = false;
                metCR = true;                       
                break;
            case ' '.charCodeAt():
                if (metNonSpace) {
                    var colName = iconv.decode(buf.slice(start, len), "gbk").toString().trim();
                    
                    var pos = {
                        colName: colName,
                        start: start,
                        end: len
                    }
                    index.push(pos);
                    logger.debug(util.inspect(pos));

                    start = len;
                    metNonSpace= false;
                }
                break;
            default:
                metNonSpace = true;
        }       
        

        if (!firstLine) {
            var colName = iconv.decode(buf.slice(start, len), "gbk").toString().trim();                           
            var pos = {
                colName: colName,
                start: start,
                end: len
            }
            index.push(pos);
            logger.debug(util.inspect(pos));
            break;
        }

        len++;
    }

    while (len++ < size) {
            if (buf[len] == 10) {
                metLF = true;
            } else if (buf[len] == 13) {
                metCR = true;
            } else {
                break;
            }                
    }

    var offset = 0;
    if (metLF) offset++;
    if (metCR) offset++;
    
    var table = [];
    var lineLen = index[index.length - 1].end;
    while (len < size && (len + lineLen < size)) {
        var user = {};
        var line = buf.slice(len, len + lineLen + offset);
        for (var i = 0; i < index.length; i++) {
            var value = iconv.decode(line.slice(index[i].start, index[i].end), "gbk").toString().trim();
            if (i == 0 && value == 0) {
                continue;
            }
            user[index[i].colName] = value;
            logger.debug(util.inspect(user));
        }
        table.push(user);
        len =  len + lineLen + offset;
    }
    
    logger.info("Parse done.");

    var workSheet = new Map();    
    for (var i = 0; i < table.length; i++) {
        var cnName = table[i]["姓名"];
        var date = table[i]["日期"];
        var checkInTime = table[i]["签到时间"];
        var checkOutTime = table[i]["签退时间"];
        if (!workSheet.has(cnName)) {
            workSheet.set(cnName, []);
        }
        var workType = "0";
        var workReason = "";
        workSheet.get(cnName).push({
            date:date,
            checkInTime:checkInTime,
            checkOutTime:checkOutTime,
            workType:workType,
            workReason: workReason
        });
    }

    logger.info("Shuffle done.");
    //logger.debug(util.inspect(workSheet));
    return workSheet;
}

exports.parse = parse;