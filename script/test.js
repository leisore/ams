var http = require("http");


var apps = [
{'App1':'app1'},
{ 'App2':'app2'},
{ 'App3':'app3'}];
console.log(JSON.stringify(apps));

var pd = {
	"sequence_no" : 'E880903152',
	"batch_no" : '1',
	"coach_no" : '12',
	"seat_no"  : '0202',
	"start_train_date_page":'2016-12-30 22:03',
	"train_code":'Z266',
	"coach_name":'12',
	"seat_name":'20号中铺',
	"seat_type_name":'硬卧',
	"train_date":'2016-12-30 00:00:00',
	"from_station_name":'西安',
	"to_station_name":'长沙',
	"start_time":'1970-01-01 22:03:00',
	"coach_name":'12',
	"passenger_name":'龙维'
};

var crypto = require('crypto');
console.log(crypto.createHash('md5').update("zhangkaikai").digest("hex"));


/*
var accessToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImxlZ2FjeS10b2tlbi1rZXkiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiI3NzQ2ZTA2YjhkZmQ0MDNjOTM5ZjQ3NWU0YTBlYWJkNiIsInN1YiI6ImVkMjNlMmJkLWIxOWEtNGQ2Ni04ZmIwLTBjNDNlOTZiOWM3NyIsInNjb3BlIjpbIm9wZW5pZCIsInVhYS5hZG1pbiIsImNsb3VkX2NvbnRyb2xsZXIucmVhZCIsInBhc3N3b3JkLndyaXRlIiwiY2xvdWRfY29udHJvbGxlci53cml0ZSJdLCJjbGllbnRfaWQiOiJhZG1pbiIsImNpZCI6ImFkbWluIiwiYXpwIjoiYWRtaW4iLCJncmFudF90eXBlIjoicGFzc3dvcmQiLCJ1c2VyX2lkIjoiZWQyM2UyYmQtYjE5YS00ZDY2LThmYjAtMGM0M2U5NmI5Yzc3Iiwib3JpZ2luIjoidWFhIiwidXNlcl9uYW1lIjoibGVpc29yZSIsImVtYWlsIjoibGVpc29yZUBxcS5jb20iLCJhdXRoX3RpbWUiOjE0ODA0OTE0NzcsInJldl9zaWciOiI4NDhiNDQxMiIsImlhdCI6MTQ4MDQ5MTQ3NywiZXhwIjoxNDgwNTM0Njc3LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvdWFhL29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbImNsb3VkX2NvbnRyb2xsZXIiLCJwYXNzd29yZCIsInVhYSIsIm9wZW5pZCIsImFkbWluIl19.-WCMCSXlUTDyLu6LJSBZELcK2etulQycrm5zwH21mCY";

{
	// create user
	var testUser = {
	  "externalId" : null,
	  "meta" : {
	    "version" : 0,
	    "created" : "2016-11-30T20:58:16.123Z"
	  },
	  "userName" : "test",
	  "name" : {
	    "formatted" : "given name family name",
	    "familyName" : "lee",
	    "givenName" : "test"
	  },
	  "emails" : [ {
	    "value" : "test@test.org",
	    "primary" : true
	  } ],
	  "phoneNumbers" : [ {
	    "value" : "5555555555"
	  } ],
	  "active" : true,
	  "verified" : true,
	  "origin" : "uaa",
	  "password" : "test2",
	  "schemas" : [ "urn:scim:schemas:core:1.0" ]
	};

	var options = {
		hostname: "localhost",
		port: 8080,
		path: "/uaa/Users",
		method: "post",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization':'Bearer ' + accessToken
		}
	};

	var req = http.request(options, res => {
		console.log(`Status: ${res.statusCode}`);
	  	console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		  res.setEncoding('utf8');
		  res.on('data', (chunk) => {
		    console.log(`BODY: ${chunk}`);
		  });
		  res.on('end', () => {
		    console.log('No more data in response.')
		  })
	});

	req.on('error', (e) => {
	  console.log(`problem with request: ${e.message}`);
	});

	req.write(JSON.stringify(testUser));
	req.end();
}

// list users
*/