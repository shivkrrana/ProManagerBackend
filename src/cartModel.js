const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    products: [
        {
            id: {
                type: String
            },
            quantity: {
                type: Number
            }
        }
    ]
});

const Cart = new mongoose.model("Carts", cartSchema);

module.exports = Cart;