
const mongoose = require("mongoose");
mongoose.connect(process.env.DB)//("mongodb://localhost:27017/Registered_User")
    .then(() => { console.log("DB connected") })
    .catch((error) => { console.log(error) });