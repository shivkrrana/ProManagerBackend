const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    imgsrc: {
        type: String,
        required: true
    }

});

const Product = new mongoose.model("products", cartSchema);

module.exports = Product;