function addLoadEvent(func) {
    var oldload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldload();
            func();
        };
    }
}

function uid() {
    var uid = document.getElementById("uid").getAttribute("value")
    return uid;
}

function ajaxCall(url, method, callback, data) {
    if (window.ActiveXObject) {
        var proxy = new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        var proxy = new XMLHttpRequest();
    } else {
        proxy = false;
    }
    proxy.open(method, url, true);
    proxy.onreadystatechange = function () {
        if (proxy.readyState == 4) {
            if (callback) callback(proxy.responseText);
        }
    };
    proxy.send(data);
}

function appendMainFrame(e) {
    var mainFrame = document.getElementById("mainFrame");
    var nodes = mainFrame.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        mainFrame.removeChild(nodes[i]);
        alert(nodes[i]);
    }
}

function employeeSubmitCurrent() {
    var url = document.getElementById("employeeCurrentForm").action;    
    var elements = document.getElementById("employeeCurrentForm").elements;
    for (var i = 0; i< elements.length; i++) {
        if (elements[i].tagName == "INPUT" && elements[i].type=="radio") {
            if (elements[i].checked) {
                url += "&" + elements[i].name + "=" + elements[i].value;
            }
        } else {
            url += "&" + elements[i].name + "=" + elements[i].value;
        }         
    }    
    ajaxCall(url, "get", function(current) {
        document.getElementById("mainFrame").innerHTML = current;
    });
    return false;    
}

function employeeCurrent() {
    ajaxCall("/employee/current;uid=" + uid(), "get", function(current) {
        document.getElementById("mainFrame").innerHTML = current;
        document.getElementById("currentCommit").onclick = employeeSubmitCurrent;
        document.getElementById("currentCommit2").onclick = employeeSubmitCurrent;
    });
    return false;
}

function employeeHistory() {
    ajaxCall("/employee/history;uid=" + uid(), "get", function(current) {
        var mainFrame = document.getElementById("mainFrame");
        mainFrame.innerHTML = current;
        mainFrame.childNodes.forEach(v => {
            v.childNodes.forEach(v2 => {
                v2.onclick = function() {
                    var ym = v2.innerText;
                    ajaxCall("/employee/historyDetails;uid=" + uid() + '?date=' + ym, "get", function(current) {
                        document.getElementById("mainFrame").innerHTML = current;
                    });                    
                }
            });
        });
    });
    return false;
}

function changePassword() {
    document.getElementById("mainFrame").innerHTML = '新密码：&nbsp; <input type="password" name="newPassword" id="newPassword" value=""></input><p/>\
                           <a href="#" id="changePasswordConfirm">确认</a>';
    document.getElementById("changePasswordConfirm").onclick = function() {
            var newP = document.getElementById("newPassword").value;
            ajaxCall("/employee/changePassword;uid=" + uid() + '?newPassword=' + newP, "get", function() {
                window.location.href = "/";
            }); 
    };
}

function managerUpload() {
    document.getElementById("mainFrame").innerHTML = '\<form name="uploadForm" enctype="multipart/form-data" method="post">\
                                                        上传考勤记录：<input type="file" name="upload" multiple="multiple" id="upload1"><br>\
                                                        <a href="#" id="uploadId">上传<a/>\
					                                </form>';                        
    document.getElementById("uploadId").onclick = function() {
        var files = document.getElementById("upload1").files;
        if (files.length > 0) {
            var oData = new FormData(document.forms.namedItem("uploadForm")); 
            oData.append('upload', files[0], files[0].name);
            ajaxCall("/manager/upload;uid=" + uid(), "post", function(content){
                document.getElementById("mainFrame").innerHTML = content;
            }, oData); 
        }
    };
}

function managerReport() {
    ajaxCall("/manager/history;uid=" + uid(), "get", function(current) {
        var mainFrame = document.getElementById("mainFrame");
        mainFrame.innerHTML = current;
        mainFrame.childNodes.forEach(v => {
            v.childNodes.forEach(v2 => {
                v2.onclick = function() {
                    var ym = v2.innerText;
                    window.open("/manager/report;uid=" + uid() + '?date=' + ym, ym);
                    return false;                
                }
            });
        });
    });
    return false;    
}

function addLinkClickEvent() {
    if (!document.getElementById) return;
    document.getElementById("employeeCurrent").onclick = employeeCurrent;
    document.getElementById("employeeHistory").onclick = employeeHistory;
    document.getElementById("changePassword").onclick = changePassword;
    document.getElementById("logout").onclick = function() {window.location.href = "/";}; 
    document.getElementById("managerUpload").onclick = managerUpload;
    document.getElementById("managerReport").onclick = managerReport;    
}

addLoadEvent(addLinkClickEvent);