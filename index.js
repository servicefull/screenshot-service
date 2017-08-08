'use strict';

const exec = require('child_process').exec;
const crypto = require('crypto');
const fs = require('fs');
const aws = require('aws-sdk');

exports.handler = function(event, context, callback) {
	// PARSE MESSAGE
	const p = event.Records[0].Sns.Message;
	const payload = JSON.parse(p);

	// VARS
	const pageUrl = payload.pageUrl;
	const fileHash = crypto.createHash('md5').update(pageUrl).digest('hex');
	const size = payload['size'].split('x');
	const width = size[0];
	const height = size[1];
	const fileName = payload.fileName;
	const s3Bucket = payload.s3Bucket;
	const timeout = 30000;

	console.log(`Processing ${pageUrl} to ${s3Bucket}/${fileName}`);

	// build the cmd for phantom to render the url
	const cmd = `./phantomjs/phantomjs_linux-x86_64 --debug=yes --ignore-ssl-errors=true ./phantomjs/screenshot.js ${pageUrl} /tmp/${fileHash}.png ${width} ${height} ${timeout}`;
	// const cmd =`./phantomjs/phantomjs_osx          --debug=yes --ignore-ssl-errors=true ./phantomjs/screenshot.js ${pageUrl} /tmp/${fileHash}.png ${width} ${height} ${timeout}`;
	console.log(cmd);
	//
	exec(cmd, {
		maxBuffer: 1024 * 10000
	}, (error, stdout, stderr) => {
		console.log('ecex cmd');
		if (error) {
			// the command failed (non-zero), fail the entire call
			console.warn(`exec error: ${error}`, stdout, stderr);
			callback(`422, please try again ${error}`);
		} else {
			// snapshotting succeeded, let's upload to S3
			// read the file into buffer (perhaps make this async?)
			const fileBuffer = fs.readFileSync(`/tmp/${fileHash}.png`);
			console.log(fileBuffer)

			// upload the file
			const s3 = new aws.S3({
				params: {
					Bucket: s3Bucket,
					Key: fileName
				}
			});

			s3.upload({
				Body: fileBuffer,
				ContentType: 'image/png'
			}, function(err, data) {
				if (err) {
					console.warn(err);
					callback(err);
				} else {
					const obj = {
						Bucket: s3Bucket,
						Key: fileName
					}
					console.log(obj);
					callback(null, obj);
				}
				return;
			});
		}
	});
};
