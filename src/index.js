const express = require("express");
const cartRouter = require("./cartRouter.js");
const userRouter = require("./userRouter.js");
const productRouter = require("./productRouter.js");
const cors = require("cors");

require('dotenv').config();
require("./conn");
const app = express();
app.use(cors());
app.use(cartRouter);
app.use(userRouter);
app.use(productRouter);

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});