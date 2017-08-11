const fs = require('fs');

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

var content = {
	"Records":recordAry
};

fs.writeFile("test.json", JSON.stringify(content, null, 4), 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

var index = require('./index');
index.handler(content);
