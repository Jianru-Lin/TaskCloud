var taskListId = '';
var taskList = [];
var updateLogStartIndex = 0;
var taskDomMap = {};

// 开始自动刷新
startTaskListAutoRefresh();
startTaskAutoRefresh();

function clickSaveTask() {
	// 解析用户输入的字符串
	// 清空当前的任务列表
	// 生成新的任务条目
	var newPassword = $('#new-password').val();
	if (!newPassword) {
		$('#new-password').focus();
		return;
	}

	var text = $('#task-textarea').val();
	var taskList = parse(text);
	$('#modify-task').modal('hide');

	// 发送请求到服务端
	rpc('Task.setTaskList', {taskList: taskList}, function() {
		console.log('setTaskList ok');
	}, function() {
		console.log('setTaskList failed');
	});

	function parse(text) {
		var list = [];
		if (!text) return list;
		var pattern = /\s*([^\s]+)[ \t]+([^\s]+)/g;
		var match;
		while ((match = pattern.exec(text)) && true) {
			list.push({
				email: match[1],
				password: match[2],
				newPassword: newPassword,
				status: 'plan'
			});
			console.log('[' + match[1] + '] [' + match[2] + ']');
		}
		return list;
	}
}

function startTaskListAutoRefresh() {
	var refreshing = false;

	setInterval(function() {
		if (document.readyState !== 'complete') return;
		doRefresh();
	}, 1000);

	function doRefresh() {
		if (refreshing) return;
		rpc('Task.getTaskListId', {}, function(result) {
			// 对比 taskListId，如果不同，则需要刷新
			if (result.taskListId !== taskListId) {
				// 先删除现有的数据
				$('#task-body').empty();
				// 映射也要删除
				taskDomMap = {};
				// 下标也要删除
				updateLogStartIndex = 0;

				// 加载新的数据
				refreshTaskList(function(){
					refreshing = false;
				}, function() {
					refreshing = false;
				});
			} else {
				refreshing = false;
			}
		}, function() {
			refreshing = false;
		});
	}
}

function startTaskAutoRefresh() {
	setInterval(function() {
		if (document.readyState !== 'complete') return;
		refreshTask();
	}, 2000);
}

function refreshTaskList(scb, fcb) {
	rpc('Task.getTaskList', {}, function(result) {
		// 记录下 taskListId
		taskListId = result.taskListId;

		var tbody = $('#task-body');
		var taskList = result.taskList;

		taskList.forEach(function(task, i) {
			var tr = $('<tr></tr>');
			tr.append($('<td></td>').text(task.id));
			tr.append($('<td></td>').text(task.email || ''));
			tr.append($('<td></td>').text(task.password || ''));
			tr.append($('<td></td>').text(task.newPassword || ''));

			// 要特别记录下 status 和 detail 对应的 DOM 元素
			// 因为待会儿要修改，这样会比较方便
			var statusTd = $('<td></td>').text(localizeStatus(task.status));
			var detailTd = $('<td></td>').text(task.detail || '');
			tr.append(statusTd);
			tr.append(detailTd);

			tbody.append(tr);

			// 记录下映射关系
			taskDomMap[task.id] = {
				statusDom: statusTd,
				detailDom: detailTd
			};
		});

		// 通知上级
		if (scb) {
			scb(result);
		}
	}, fcb);

}

function refreshTask(scb, fcb) {
	rpc('Task.getUpdateLog', {
		taskListId: taskListId,
		startIndex: updateLogStartIndex
	}, success, failure);

	function success(result) {
		if (result.taskListId !== taskListId) return;
		if (!Array.isArray(result.updateLogList)) return;

		var updateLogList = result.updateLogList;

		// 更新下标
		updateLogStartIndex += updateLogList.length;

		updateLogList.forEach(function(updateLog) {
			updateTaskByLog(updateLog);
		});

		function updateTaskByLog(updateLog) {
			var m = taskDomMap[updateLog.id];
			if (!m) return;

			// 因为已经用 jquery 包装过了，所以直接修改
			m.statusDom.text(localizeStatus(updateLog.status));
			m.detailDom.text(updateLog.detail);
		}
	}

	function failure(err) {
		// console.log('refreshTask');
		// console.log(err);
	}
}

function u(id, status, detail) {
	rpc('Task.updateTask', {
		taskListId: taskListId,
		id: id,
		status: status,
		detail: detail
	}, function(result) {
		// console.log('[updateTask]');
		// console.log(result);
	}, function(err) {
		// console.log('[updateTask]');
		// console.log(err);
	});
}

function localizeStatus(status) {
	switch(status) {
		case 'success':
			return '成功';
		case 'failure':
			return '失败';
		case 'progress':
			return '进行中';
		case 'plan':
			return '未开始';
		default:
			return '未知状态';
	}
}