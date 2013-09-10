doTest(require('./test-queryDir.js'));
doTest(require('./test-renameFile.js'));

function doTest(testItem) {
	testItem.test(scb, fcb);

	function scb() {
		console.log('[passed] ' + testItem.name);
	}

	function fcb() {
		console.log('[failed] ' + testItem.name);
	}
}