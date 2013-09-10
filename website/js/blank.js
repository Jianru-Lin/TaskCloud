var idCount = 0;

function doRpc(funcName, args) {
	var id = idCount++;
	rpc(funcName, args, success, failure);
	return id;

	function success(result) {
		var wrapper = {
			id: id,
			result: result
		};
		var text = JSON.stringify(wrapper);

		// 借助 console.log 和外部通信
		console.log(text);
	}

	function failure(err) {
		err = err || {error: 'unknown'};
		var wrapper = {
			id: id,
			err: err
		};
		var text = JSON.stringify(wrapper);

		// 借助 console.log 和外部通信
		console.log(text);
	}
};