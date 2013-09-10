exports.respond = respond;

var path = require('path'),
	url = require('url'),
	respondPage = require('./respondPage').respondPage;

function respond(req, res) {
	var query = url.parse(req.url, true).query || {};

	// 调用 Task 服务的获取任务列表，然后整理输出
	serviceManager.dispatch({
		funcName: 'Task.getTaskList',
		args: {}
	}, onCallback, req, res);

	function onCallback(result) {
		var taskList = result.taskList;
		var status = query['status'];
		var filteredTaskList = filter(taskList, status);

		// 导出为文本
		var text = exportText(filteredTaskList);

		// 输出结果
		res.setHeader('Content-Disposition', 'attachment; filename=data.txt');
		res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
		res.setHeader('Content-Length', Buffer.byteLength(text));
		res.end(text);

		function filter(taskList, status) {
			if (!status) return taskList;
			if (status === 'rest') {
				// 对于 rest 就是所有非 success 非 failure 的
				// 就是所有没执行或者执行中但是还没结果的
				return taskList.filter(function(task) {
					return task.status !== 'success' && taskList.status !== 'failure';
				});
			} else {
				// 其他直接返回精确匹配的状态的
				return taskList.filter(function(task) {
					return task.status === status;
				});
			}

		}

		function exportText(taskList) {
			// 注意，如果某个任务的 status 为 success
			// 导出时密码应该采用新密码

			var stringList = [];
			taskList.forEach(function(task) {
				if (task.status === 'success') {
					// 输出新密码
					stringList.push(task.email + ' ' + task.newPassword);
				} else {
					// 输出旧密码
					stringList.push(task.email + ' ' + task.password);
				}
			});

			return stringList.join('\r\n');
		}
	}
}

function Data() {
	return this;
}