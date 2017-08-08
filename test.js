const recordAry = [];
recordAry.push({
	"Sns" : {
		"Message": JSON.stringify({
			"pageUrl": "http://www.google.com",
			"size": "1024x768",
			"fileName": "v71-httpwwwgooglecom-1024x768.png",
			"s3Bucket": "servicefull.public"
		})
	}
});

var index = require('./index');
index.handler({
	"Records":recordAry
});
