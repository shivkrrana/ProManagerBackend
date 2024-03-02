const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    dueDate: {
        type: String
    },
    createdDate : {
        type : Date,
        default : Date.now
    },
    updatedDate : {
        type : Date,
        default : Date.now
    },
    checklist: [
        {
            check: {
                type: Boolean,
                required: true
            },
            text: {
                type: String,
                required: true
            }
        }
    ]
});

const Task = new mongoose.model("Tasks", taskSchema);

module.exports = Task;