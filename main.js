var express = require('express'),
	path = require('path');

var serviceManager = require('./service-manager.js');

var app,
	webRoot;

// 让 serviceManager 随处可用
global.serviceManager = serviceManager;

webRoot = path.resolve(__dirname, 'website');
app = express();
app.use(express.json());
app.use(express.static(webRoot));

app.get('/', redirectToIndexPage);
app.get('/index', require('./page.index').respond);
app.get('/blank', require('./page.blank').respond);
app.get('/export', require('./page.export').respond);
app.get('/tag', require('./page.tag').respond);
app.post('/service', service);

app.listen(80);

function redirectToIndexPage(req, res) {
	res.statusCode = 301;
	res.setHeader('Location', '/index');
	res.end();
}

function service(req, res) {
	var jsonReqObj = req.body;
	if (!jsonReqObj) {
		res.statusCode = 400;
		res.end();
		return;
	}

	serviceManager.dispatch(jsonReqObj, cb, req, res);

	function cb(jsonResObj) {
		var text = JSON.stringify(jsonResObj);
		var length = Buffer.byteLength(text, 'utf8');
		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.setHeader('Content-Length', length);
		res.end(text);
	}
}