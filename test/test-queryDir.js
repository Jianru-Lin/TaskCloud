exports.name = 'queryDir() test';
exports.test = test;

var queryDir = require('../lib/queryDir.js').queryDir;

function test(scb, fcb) {
	var dir = process.env['SystemRoot'];

	try {
		queryDir(dir, queryDirScb, queryDirFcb);
	} catch(err) {
		// 测试失败
		fcb();
	}

	function queryDirScb(dirList, fileList) {
		if (Array.isArray(dirList) && Array.isArray(fileList)) {
			// 测试通过
			scb();
		} else {
			// 测试失败
			fcb();
		}
	}

	function queryDirFcb() {
		fcb();
	}

	function printList(title, list) {
		console.log(title);
		list.forEach(function(item) {
			console.log(item)
		});
		console.log('');
	}
}