const express = require('express');
const globalMiddlewares = require('../middlewares/global-middlewares');
const controller = require('./tasks-controller')

const router = express.Router();

router.use(globalMiddlewares.bearerTokenAuth)

// GET Tasks
router.get('/', globalMiddlewares.authenticateToken, controller.getTasks)


// POST Task
router.post('/', globalMiddlewares.checkBody, globalMiddlewares.authenticateToken, controller.createTask)

// Update one /tasks/1213323
router.patch("/:id", globalMiddlewares.checkBody, globalMiddlewares.authenticateToken, controller.updateTask)
    
// Delete one /tasks/1213323
router.delete("/:id", globalMiddlewares.authenticateToken, controller.deleteTask )

module.exports = router
