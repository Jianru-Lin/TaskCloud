exports.respond = respond;

var path = require('path'),
	respondPage = require('./respondPage').respondPage;

var auth = require('./auth.json');

function respond(req, res) {debugger;
	if (auth.enable === true) {
		// 进行身份验证
		if (!verifyAuth()) {
			// 身份验证未通过
			needAuth();
			return;
		}
	}

	// 根据模板生成内容返回
	respondPage('index.kl', new Data(), req, res);

	function verifyAuth() {
		var authHeader = req.headers['authorization'];
		if (!authHeader) return false;

		var match = /Basic ([^$]+)$/.exec(authHeader);
		if (!match) return false;

		var authValue = match[1];
		if (!authValue) return false;

		// base64 解码
		var authValue = decodeBase64(authValue);

		// 比较用户名和密码
		if (authValue === (auth.username + ':' + auth.password)) {
			return true;
		} else {
			return false;
		}
	}

	function needAuth() {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Login"');
		res.end();
	}
}

function Data() {
	return this;
}

function decodeBase64(text) {
	var buffer = new Buffer(text, 'base64');
	return buffer.toString();
}