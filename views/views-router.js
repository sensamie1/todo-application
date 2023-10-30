const express = require('express');
const userService = require('../users/users-services');
const taskService = require('../tasks/tasks-services');
const userMiddleware = require('../users/users-middleware');
const TaskModel = require('../models/task-model');

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const router = express.Router();

router.use(cookieParser())

router.use(express.static('./views'));

// /views (welcome page)
router.get('/', (req, res) => {
    res.render('welcome', { user: res.locals.user, });
})

// /views/welcome (welcome page)
router.get('/welcome', (req, res) => {
    res.render('welcome', { user: res.locals.user, });
})

// /views/signup (signup page)
router.get('/signup', (req, res) => {
    res.render('signup', { user: res.locals.user || null,  messages: req.flash() });
})


// /views/signup (signup post request)
router.post('/signup', userMiddleware.ValidateUserCreation, async (req, res) => {
    const response = await userService.CreateUser(req.body);
    if (response.code === 200) {
        req.flash('success', 'Signup successful. You can now login.');
        res.redirect('signup');
    } else if (response.code === 409) {
        req.flash('error', 'User already exists. Login or signup with different details.');
        res.redirect('signup');
    } else {
        req.flash('error', response.message);
        res.redirect('404');
    }
});

// /views/login (login page)
router.get('/login', (req, res) => {
    res.render('login', { user: res.locals.user || null, messages: req.flash() });
})

// /views/login (login post request)
router.post('/login', userMiddleware.LoginValidation, async (req, res) => {
    const response = await userService.Login({ username: req.body.username, password: req.body.password })
    if (response.code === 200) {
        // set cookie
        res.cookie('jwt', response.data.token, {maxAge: 1 * 24 * 60 * 60 * 1000})
        res.redirect('home')
    } else if (response.code === 404) {
        req.flash('error', 'Sorry, the user details provided are invalid. Please check the details and try again.');
        res.redirect('login')
    }else if (response.code === 422) {
        req.flash('error', 'Sorry, the username or password provided is incorrect. Please check your login details and try again.');
        res.redirect('login')
    }else {
        res.render('404', { error: response.message })
    }
});


// PROTECTED ROUTE
router.use(async (req, res, next) => {

    const token = req.cookies.jwt;

    if (token) {
        try {
            const decodedValue = await jwt.verify(token, process.env.JWT_SECRET);

            res.locals.user = decodedValue
            next()
        } catch (error) {
            res.redirect('welcome')
        }
    } else {
        res.redirect('welcome')
    }
})

// /views/logout
router.get('/logout', (req, res) => {    
    res.clearCookie('jwt')
    res.redirect('login')
});

// /views/home (user logged in)
router.get('/home', (req, res) => {
    console.log({ user: res.locals.user })
    res.render('home', { user: res.locals.user });
})

// /views/taskcreate (get create task page)
router.get('/taskcreate', (req, res) => {
    res.render('taskcreate', { user: res.locals.user, messages: req.flash() });
})

// /views/taskcreate (user create task)
router.post('/taskcreate', async (req, res) => {
    const response = await taskService.createTasks({
        task_name: req.body.task_name,
        description: req.body.description,
        status: "pending",
        user_id: res.locals.user._id,
        start_date: req.body.start_date,
        due_date: req.body.due_date
    });
    console.log({ body : req.body })

    if (response.code === 200) {
        req.flash('success', 'Task created! Check all tasks.');
        res.redirect('taskcreate')
    } else {
        req.flash('error', 'Error creating task! Try again.');
        res.render('taskcreate', { error: response.message })
    }
})

// /views/tasks/update/:id (user update task status by id)
router.post('/tasks/update/:id', userService.isAuthenticatedForUpdate, taskService.updateStatus)

// /views/tasks/edit/:id (user edit task by id)
router.post('/tasks1/edit/:id', userService.isAuthenticatedForUpdate, taskService.editTask)

// /views/tasks/delete/:id (user update task to delete by id)
router.post('/tasks/delete/:id', userService.isAuthenticatedForUpdate, taskService.deleteStatus)

// /views/tasks/:id (user permanently delete task by id)
router.post('/tasks/:id', userService.isAuthenticatedForUpdate, taskService.deleteTask)

// /views/tasks/edit/:id (get task for editing)
router.get('/tasks/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.redirect('/tasknotcreated');
        }

        const tasks = await TaskModel.findById(id);
        console.log(tasks);
        if (!tasks) {
            res.redirect('/tasknotcreated');
        } else {
            console.log(tasks);
            res.render('edittask', { 
                tasks: tasks,
            });
        }
    } catch (error) {
        console.error(error);
        res.redirect('/tasknotcreated');
    }
});

// /views/tasks (get all tasks for each user)
router.get('/tasks', async (req, res) => {
    const perPage = 5;
    const page = req.query.page || 1;
    try {
        const totalCount = await TaskModel.countDocuments({ user_id: res.locals.user._id, status: { $in: ['pending', 'completed'] } });
        const tasks = await TaskModel.find({ user_id: res.locals.user._id, status: { $in: ['pending', 'completed'] } })
            .sort({ created_at: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);

        if (tasks.length === 0) {
            res.render('tasknotcreated');
        } else {
            res.render('tasks', { 
                tasks: tasks,
                current: page,
                pages: Math.ceil(totalCount / perPage)
            });
        }
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// /views/taskspending (get all pending tasks for each user)
router.get('/taskspending', async (req, res) => {
    const perPage = 5;
    const page = req.query.page || 1;
    try {
        const totalCount = await TaskModel.countDocuments({ user_id: res.locals.user._id, status: { $in: ['pending'] } });
        const tasks = await TaskModel.find({ user_id: res.locals.user._id, status: { $in: ['pending'] } })
            .sort({ created_at: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);

        res.render('taskspending', { 
            tasks: tasks,
            current: page,
            pages: Math.ceil(totalCount / perPage)
        })
    } catch (error) {
        console.error(error);
        res.render('error');
    }
})

// /views/taskscompleted (get all completed tasks for each user)
router.get('/taskscompleted', async (req, res) => {
    const perPage = 5;
    const page = req.query.page || 1;
    try {
        const totalCount = await TaskModel.countDocuments({ user_id: res.locals.user._id, status: { $in: ['completed'] } });
        const tasks = await TaskModel.find({ user_id: res.locals.user._id, status: { $in: ['completed'] } })
            .sort({ created_at: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);

        res.render('taskscompleted', { 
            tasks: tasks,
            current: page,
            pages: Math.ceil(totalCount / perPage)
        })
    } catch (error) {
        console.error(error);
        res.render('error');
    }
})

// /views/tasksdeleted (get all deleted tasks for each user)
router.get('/tasksdeleted', async (req, res) => {
    const perPage = 5;
    const page = req.query.page || 1;
    try {
        const totalCount = await TaskModel.countDocuments({ user_id: res.locals.user._id, status: { $in: ['deleted'] } });
        const tasks = await TaskModel.find({ user_id: res.locals.user._id, status: { $in: ['deleted'] } })
            .sort({ created_at: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage);

        res.render('tasksdeleted', { 
            tasks: tasks,
            current: page,
            pages: Math.ceil(totalCount / perPage)
        })
    } catch (error) {
        console.error(error);
        res.render('error');
    }
})

// /views/taskupdatesuccess (task update success)
router.get('/taskupdatesuccess', async (req, res) => {
    res.render('taskupdatesuccess')
})

// /views/taskdeletesuccess (task delete success)
router.get('/taskdeletesuccess', async (req, res) => {
    res.render('taskdeletesuccess')
})


// error page
router.get('*', (req, res) => {
    res.render('404', { user: res.locals.user || null });
})

module.exports = router;
