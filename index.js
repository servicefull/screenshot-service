'use strict';

const aws = require('aws-sdk');
const Chromeless = require('chromeless').default

exports.handler = (event, context, callback) => {
	// PARSE MESSAGE
	const p = event.Records[0].Sns.Message;
	const payload = JSON.parse(p);
	const arn = process.env.AWS_TOPIC_ARN;
	const sns = new aws.SNS();

	/* process.env vars
	CHROMELESS_ENDPOINT_URL
	CHROMELESS_ENDPOINT_API_KEY
	*/

	// VARS
	const pageUrl = payload.pageUrl;
	const size = payload['size'].split('x');
	const chromeless = new Chromeless({
  	remote: true
	});

	const screenshot = new Promise(function(resolve, reject) {
		resolve(chromeless
			.setViewport({width: parseInt(size[0]), height: 99999, scale: 1})
			.goto(pageUrl)
			.screenshot());
	});

	screenshot.then((res) => {
		chromeless.end();
		payload.screenshot = res;
		console.log(payload);
		sns.publish({
			TopicArn: arn,
			Message: JSON.stringify(payload)
		}, function(err, data) {
			if (err) {
				console.error('error publishing to SNS: ',err);
			} else {
				console.info('message published to SNS');
				callback(null, 'success');
			}
		});
	}).catch((err) => console.log('error with screenshot: ', err));

};
