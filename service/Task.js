exports.serviceName = 'Task';
exports.setTaskList = setTaskList;
exports.getTaskList = getTaskList;
exports.getTaskListId = getTaskListId;
exports.getUpdateLog = getUpdateLog;

exports.getPlanTask = getPlanTask;
exports.updateTask = updateTask;

var lastPlanId = -1;
var gTaskListId = (new Date()).toISOString();
var gTaskList = [];
var gUpdateLog = [];

function setTaskList(args, callback) {
	var taskList = args.taskList;
	if (Array.isArray(taskList)){
		// 为每一个 task 设置一下 id
		taskList.forEach(function(task, i) {
			task.id = i;
		});

		gTaskList = taskList;
		_updateTaskListId();
		_resetLastPlanId();
		_resetUpdateLog();
	}
	callback({
		taskListId: gTaskListId
	});
}

function getTaskList(args, callback) {
	callback({
		taskListId: gTaskListId,
		taskList: gTaskList
	});
}

function getTaskListId(args, callback) {
	callback({
		taskListId: gTaskListId
	});
}

function getPlanTask(args, callback) {
	if (lastPlanId >= gTaskList.length) {
		callback({error: 'no more plan task'});
		return;
	}

	var planTask;
	for (++lastPlanId; lastPlanId < gTaskList.length; ++lastPlanId) {
		if (gTaskList[lastPlanId].status === 'plan') {
			planTask = gTaskList[lastPlanId];
			break;
		}
	}

	if (!planTask) {
		callback({error: 'no more plan task'});
		return;
	}

	// 返回找到的任务
	// 在此之前需要给它补上两个属性
	// 因为待会儿更新它们的状态的时候要用到
	planTask.taskListId = gTaskListId;
	planTask.id = lastPlanId;
	callback(planTask);
}

function updateTask(args, callback) {debugger;
	var taskListId,
		id;

	taskListId = args.taskListId;
	id = args.id;

	if (taskListId !== gTaskListId) {
		callback({error: 'taskListId mismatch'});
		return;
	}

	var task = gTaskList[id];
	if (!task) {
		callback({error: 'task not found'});
		return;
	}

	// 只能更新 status 和 detail
	task.status = args.status;
	task.detail = args.detail;

	// 记录到日志中
	gUpdateLog.push({
		id: id,
		status: task.status,
		detail: task.detail
	});

	// 把更新后的结果返回
	callback(task);
}

function getUpdateLog(args, callback) {
	var taskListId,
		startIndex;

	taskListId = args.taskListId;
	if (taskListId !== gTaskListId) {
		callback({error: 'taskListId mismatch'});
		return;
	}

	startIndex = args.startIndex;
	if (startIndex < 0 || startIndex >= gUpdateLog.length) {
		callback({error: 'startIndex out of range'});
		return;
	}

	var updateLogList = [];
	for (var i = startIndex; i < gUpdateLog.length; ++i) {
		updateLogList.push(gUpdateLog[i]);
	}

	var result = {
		taskListId: gTaskListId,
		updateLogList: updateLogList
	};

	console.log('startIndex=' + startIndex);
	console.log('totalLength=' + gUpdateLog.length);
	console.log('length=' + updateLogList.length);
	callback(result);
}

function _updateTaskListId() {
	gTaskListId = (new Date()).toISOString();
}

function _resetLastPlanId() {
	lastPlanId = -1;
}

function _resetUpdateLog() {
	gUpdateLog = [];
}