const express = require("express");
const taskRouter = require("./taskRouter.js");
const userRouter = require("./userRouter.js");
const cors = require("cors");
var cookieParser = require('cookie-parser');
require('dotenv').config();
require("./conn");

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(taskRouter);
app.use(userRouter);

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});