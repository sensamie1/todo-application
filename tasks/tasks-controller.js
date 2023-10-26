const TaskModel = require('../models/task-model');
const logger = require('../logger');

const createTask = async (req, res) => {
  try {
    logger.info('[CreateTask] => Create task process started...')
    const taskFromRequest = req.body

    const existingTask = await TaskModel.findOne({
      $and: [
        { task_name: taskFromRequest.task_name },
        { user_id: req.user._id }
      ]
    });
    
    if (existingTask) {
      return res.status(409).json({
        message: 'Task already created',
      });
    }
  
    const task = await TaskModel.create({
      task_name: taskFromRequest.task_name,
      description: taskFromRequest.description,
      user_id: req.user._id,
    });
  
    logger.info('[CreateTask] => Create task process done.')
    return res.status(201).json({
      message: 'Task created successfully',
      data: task
    }) 
  } catch (error) {
      return res.status(500).json({
        message: 'Server Error',
        data: null
      })
  }

}

const getTasks = async (req, res) => {
  try {
    logger.info('[GetTask] => Get task process started...');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const totalCount = await TaskModel.countDocuments({ user_id: req.user._id });
    const tasks = await TaskModel.find({ user_id: req.user._id }).skip(skip).limit(limit);

    logger.info('[GetTask] => Get task process done.');

    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      return res.status(200).json({
        message: 'No more pages',
        currentPage: page,
        totalPages: totalPages,
      });
    }

    return res.status(200).json({
      message: 'Tasks fetched successfully',
      tasks,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server Error',
      data: null,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    logger.info('[UpdateTask] => Update task process started...')

    const taskId = req.params.id;
    const userId = req.user._id

    const task = await TaskModel.findOne({ _id: taskId, user_id: userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    task.task_name = req.body.task_name || task.task_name;
    task.description = req.body.description || task.description;

    const updatedTask = await task.save();

    logger.info('[UpdateTask] => Update task process done.')
    return res.status(200).json({
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      data: null
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    logger.info('[DeleteTask] => Delete task process start...');

    const taskId = req.params.id;
    const userId = req.user._id;

    const deletedTask = await TaskModel.findByIdAndRemove({ _id: taskId, user_id: userId });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    logger.info('[DeleteTask] => Delete task process done.');
    return res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server Error',
      data: null,
    });
  }
};


module.exports = {
  createTask,  
  getTasks,
  updateTask,
  deleteTask
}