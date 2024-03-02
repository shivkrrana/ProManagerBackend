const express = require("express");
const jwtUtil = require('./jwtUtil');
const Task = require("./taskModel");
const User = require("./userModel");
const router = new express.Router();
const mongoose = require("mongoose");
router.use(express.json());

// <----------------- Add Task ----------------->
router.post('/addtask', jwtUtil.verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.email
        })
        const obj = {
            userId: user._id
        }
        const document = new Task({ ...req.body, ...obj });
        const result = await document.save();
        if (result)
            res.status(201).send({ message: 'Task Added' });
        else
            res.status(400).send({ message: 'Task not added' });
    } catch (error) {
        res.status(500).send(error)
    }
})

// <----------------- Edit Task ----------------->
router.put('/edittask/:taskid', jwtUtil.verifyToken, async (req, res) => {
    try {
        const result = await Task.findOneAndUpdate({ _id: req.params.taskid }, {...req.body, updatedDate : new Date()}, { new: true });
        if (result)
            res.status(200).send({ message: 'Task Edited' });
        else
            res.status(400).send({ message: 'Task Not Edited' });
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

// <----------------- All Task ----------------->
router.get('/alltask/:filter', jwtUtil.verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.email
        })

        const today = new Date();

        if (req.params.filter === 'week') {
            const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
            const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
            const task = await Task.find(
                {
                    userId: user._id,
                    createdDate: {
                        $gte: start,
                        $lt: end
                    }
                }
            ).sort({updatedDate : 1});
            if (task)
                taskFun(task, res, user);
        }

        else if (req.params.filter === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const task = await Task.find(
                {
                    userId: user._id,
                    createdDate: {
                        $gte: start,
                        $lt: end
                    }
                }
            ).sort({updatedDate : 1});
            if (task)
                taskFun(task, res, user);
        }

        else if (req.params.filter === 'today') {
            const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const task = await Task.find(
                {
                    userId: user._id,
                    createdDate: {
                        $gte: start,
                        $lt: end
                    }
                }
            ).sort({updatedDate : 1});
            if (task)
                taskFun(task, res, user);
        }
        else
            res.status(404).send({ message: 'Wrong Parameter' });

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
})

function taskFun(task, res, user) {
    if (task) {
        const Todo = [];
        const Backlog = [];
        const Progress = [];
        const Done = [];

        task.map(item => {
            if (item.status === 'TO-DO')
                Todo.push(item);
            else if (item.status === 'BACKLOG')
                Backlog.push(item);
            else if (item.status === 'PROGRESS')
                Progress.push(item);
            else if (item.status === 'DONE')
                Done.push(item);
        })

        const obj = {
            todo: Todo, backlog: Backlog, progress: Progress, done: Done
        }
        res.status(200).send({ name: user.name, task: obj });
    }
    else
        res.status(203).send({ name: user.name, task: [] });
}

// <----------------- Analytics ----------------->
router.get('/analytics', jwtUtil.verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.email
        })

        const task = await Task.find({
            userId: user._id
        })

        if (task) {
            const list = [
                {
                    TaskName: 'Backlog Tasks',
                    Number: 0
                },
                {
                    TaskName: 'To-do Tasks',
                    Number: 0,
                },
                {
                    TaskName: 'In-Progress Tasks',
                    Number: 0
                },
                {
                    TaskName: 'Completed Tasks',
                    Number: 0
                },
                {
                    TaskName: 'Low Priority',
                    Number: 0
                },
                {
                    TaskName: 'Moderate Priority',
                    Number: 0
                },
                {
                    TaskName: 'High Priority',
                    Number: 0
                },
                {
                    TaskName: 'Due Date Tasks',
                    Number: 0
                }
            ]

            task.map(item => {
                if (item.status === 'BACKLOG')
                list[0].Number++;
                else if (item.status === 'TO-DO')
                list[1].Number++;
                else if (item.status === 'PROGRESS')
                list[2].Number++;
                else if (item.status === 'DONE')
                list[3].Number++;
                
                if (item.priority === 'LOW' && item.status !== 'DONE')
                list[4].Number++;
                else if (item.priority === 'MODERATE' && item.status !== 'DONE')
                list[5].Number++;
                else if (item.priority === 'HIGH' && item.status !== 'DONE')
                list[6].Number++;

                if (item.dueDate !== '' && item.status !== 'DONE')
                list[7].Number++;

            })

            res.status(200).send({ name: user.name, task: list });
        }
        else
            res.status(203).send({ name: user.name, task: list });

    } catch (error) {
        res.status(500).send(error);
    }
})

// <----------------- Change Task Status ----------------->
router.patch('/switchstatus/:taskid', jwtUtil.verifyToken, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate({ _id: req.params.taskid }, req.body, { new: true });
        if (task) {
            res.status(204).send({ message: 'Task Switched' });
        } else res.status(400).send({ message: 'Unable to switch Task' });
    } catch (error) {
        res.status(500).send(error)
    }
})

// <----------------- Update Checklist ----------------->
router.patch('/checklist/:taskid', jwtUtil.verifyToken, async (req, res) => {
    try {
        const result = await Task.findOneAndUpdate({ _id: req.params.taskid, 'checklist._id': req.body.checklistId }, { $set: { ['checklist.$.check']: req.body.checklistValue } }, { new: true });
        if (result) {
            const task = await Task.findOne({ _id: req.params.taskid });
            res.status(200).send({ message: 'Checklist Updated', task: task });
        } else res.status(400).send({ message: 'Unable to update Checklist' });
    } catch (error) {
        res.status(500).send(error)
    }
})

// <----------------- Remove Task ----------------->
router.delete('/delete/:taskid', async (req, res) => {
    try {
        const result = await Task.deleteOne({ _id: req.params.taskid });
        if (result) {
            res.status(200).send({ message: 'Task Deleted' });
        } else res.status(400).send({ message: 'Task Not Deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
})

// <----------------- Shared Task ----------------->
router.get('/share/:taskid', async (req, res) => {
    try {
        if(mongoose.Types.ObjectId.isValid(req.params.taskid)){
            const task = await Task.findOne({ _id: req.params.taskid });
        if (task) {
            res.status(200).send({ task: task });
        } else res.status(400).send({ message: 'Network Error' });
        }
        else res.status(404).send({ message: 'No Task Found' });
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;