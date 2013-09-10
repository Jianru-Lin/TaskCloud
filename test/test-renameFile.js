exports.name = 'renameFile() test';
exports.test = test;

var fs = require('fs'),
	path = require('path');
var renameFile = require('../lib/renameFile.js').renameFile;

function test(scb, fcb) {
	var filePathAbs = path.resolve(__dirname, 'testData/rename-me.txt');
	var newName = 'rename-me-ok.txt';

	try {
		renameFile(filePathAbs, newName, renameFileScb, renameFileFcb);
	} catch(err) {
		// 测试失败
		fcb();
	}

	function renameFileScb() {
		// 看看文件名是不是真的改了
		if (fs.existsSync(path.resolve(__dirname, 'testData', newName))) {
			// 测试成功
			scb();
		} else {
			fcb();
		}
	}

	function renameFileFcb() {
		fcb();
	}
}

function prepareTestData(scb, fcb) {
	
}

function cleanTestData(scb, fcb) {
	
}