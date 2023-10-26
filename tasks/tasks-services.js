const TaskModel = require('../models/task-model');
const logger = require('../logger');

const getAllTasks = async () => {
  logger.info('[GetAllTasks] => Get all tasks process started...');
  const tasks = await TaskModel.find({});

  logger.info('[GetAllTasks] => Get all tasks process done.');
  return {
    code: 200,
    success: true,
    message: 'Pending tasks fetched successfully',
    data: {
      tasks
    }
  }
}

const getPendingTasks = async () => {
  logger.info('[GetPendingTasks] => Get pending tasks process started...');
  const tasks = await TaskModel.find({ status: 'pending' });

  logger.info('[GetPendingTasks] => Get pending tasks process done.');
  return {
    code: 200,
    success: true,
    message: 'Pending tasks fetched successfully',
    data: {
      tasks
    }
  }
}

const getCompletedTasks = async () => {
  logger.info('[GetCompletedTasks] => Get completed tasks process started...');
  const tasks = await TaskModel.find({ status: 'completed' });

  logger.info('[GetCompletedTasks] => Get completed tasks process done.');
  return {
    code: 200,
    success: true,
    message: 'Pending tasks fetched successfully',
    data: {
      tasks
    }
  }
}
const getDeletedTasks = async () => {
  logger.info('[GetDeletedTasks] => Get deleted tasks process started...');
  const tasks = await TaskModel.find({ status: 'deleted' });

  logger.info('[GetDeletedTasks] => Get deleted tasks process done.');
  return {
    code: 200,
    success: true,
    message: 'Pending tasks fetched successfully',
    data: {
      tasks
    }
  }
}

const createTasks = async ({ task_name, description, user_id, start_date, due_date }) => {
  logger.info('[CreateTasks] => Create tasks process started...');
  const newTask = { task_name, description, user_id, start_date, due_date }

  const task = TaskModel.create(newTask);

  logger.info('[CreateTasks] => Create tasks process done.');
  return {
    code: 200,
    success: true,
    message: 'Task created successfully',
    data: {
      task
    }
  }
}

const updateStatus = async (req, res) => {
  logger.info('[UpdateStatus] => Update task status process started...');
  const id = req.params.id;
  const updatedTask = req.body
  console.log(updatedTask);
  TaskModel.findByIdAndUpdate(id, updatedTask, { new: true })
    .then(newStatus => {
      res.redirect('/views/taskupdatesuccess')
      logger.info('[UpdateStatus] => Update task status process done.');
    }).catch(err => {
      console.log(err) 
      return res.status(500).send(err)
    })

}

const editTask = async (req, res) => {
  logger.info('[EditTask] => Edit task process started...');
  const id = req.params.id;
  const updatedTask = req.body
  console.log(updatedTask);
  TaskModel.findByIdAndUpdate(id, updatedTask, { new: true })
    .then(newTask => {
      res.redirect('/views/taskupdatesuccess')
    logger.info('[EditTask] => Edit task process done.');
    }).catch(err => {
      console.log(err) 
      return res.status(500).send(err)
    })

}

const deleteStatus = async (req, res) => {
  logger.info('[ChnageDeleteStatus] => Change delete status process started...');
  const id = req.params.id;
  const updatedTask = req.body
  console.log(updatedTask);
  TaskModel.findByIdAndUpdate(id, updatedTask, { new: true })
    .then(newStatus => {
      res.redirect('/views/taskdeletesuccess')
    logger.info('[ChnageDeleteStatus] => Change delete status process done.');
    }).catch(err => {
      console.log(err) 
      return res.status(500).send(err)
    })

}

const deleteTask = async (req, res) => {
  logger.info('[PermenentDelete] => Permanent delete process started...');

  const id = req.params.id;
  TaskModel.findByIdAndRemove(id)
    .then(response => {
    res.redirect('/views/tasksdeleted')
  logger.info('[PermenentDelete] => Permanent delete process done.');
  }).catch(err => {
      console.log(err) 
      return res.status(500).send(err)
    })
}

module.exports = {
  getAllTasks,
  getPendingTasks,
  getCompletedTasks,
  getDeletedTasks,
  createTasks,
  updateStatus,
  editTask,
  deleteStatus,
  deleteTask
}