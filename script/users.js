var fs = require("fs");

var tools = require("./tools.js");

var userManager = {
    userList: [],
    loadUsers: function() {
        this.userList = JSON.parse(fs.readFileSync("./config/users.json"));
    },
    storeUsers: function() {
        fs.writeFileSync("./config/users.json", JSON.stringify(this.userList, null, "    "));
    },
    getUser: function(username) {
        for (var i = 0; i < this.userList.length; i++) {
            if (username == this.userList[i].username) {
                return this.userList[i];
            }
        }
        return null;
    },
    updateUser: function(username, password,isadmin) {
        var user = this.getUser(username);
        if (user) {
            user.username = username;
            user.password = tools.md5(password);
            user.isadmin = isadmin;
        } else {
            this.addUserusername, password,isadmin();
        }
        this.storeUsers();
    },
    isValidUser: function(username, password) {
        return this.getUser(username) && (tools.md5(password) == this.getUser(username)["password"]);
    },
    addUser: function(username, password, isAdmin) {
        this.userList.push({
            "username": username,
            "password": tools.md5(password),
            "isadmin": isAdmin,
            "uid":"",
            "loginDate":-1,
        });
        this.storeUsers();
    },
    loginUser: function(username) {
        var uid = tools.uid();
        this.getUser(username).uid = uid; 
        this.getUser(username).loginDate = Date.now();
        return uid;
    },
    getUsernameByUid: function(uid) {
        for (var i = 0; i < this.userList.length; i++) {
            if (uid == this.userList[i].uid) {
                return this.userList[i].username;
            }
        }
        return null;
    },
    isAdmin: function(uid) {
        for (var i = 0; i < this.userList.length; i++) {
            if (uid == this.userList[i].uid) {
                return this.userList[i].isadmin;
            }
        }        
        return false;
    }    
};

exports.userManager = userManager;
