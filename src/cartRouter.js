const express = require("express");
const jwtUtil = require('./jwtUtil')
const Cart = require("./cartModel");
const Product = require("./productModel");
const router = new express.Router();
router.use(express.json());


router.post('/cart-product', jwtUtil.verifyToken, async (req, res) => {
    try {
        const cartExists = await Cart.findOne({
            userId: req.body.userId
        })
        console.log("exists ", cartExists);
        if (cartExists) {
            const productId = req.body.cartItem.id;
            const item = cartExists.products.find(c => c.id == productId)
            if (item) {
                const _cart = await Cart.updateOne({ "userId": req.body.userId, "products.id": productId }, {
                    "$set": {
                        "products.$.quantity": item.quantity + req.body.cartItem.quantity
                    }
                })
                if (_cart) {
                    return res.status(201).json({ cart: _cart })
                }
            }
            else {
                console.log("CartItem ", req.body.cartItem)
                const _cart = await Cart.updateOne({ userId: req.body.userId }, {
                    "$push": {
                        "products": req.body.cartItem
                    }
                })
                if (_cart) {
                    return res.status(201).json({ cart: _cart })
                }

            }
        } else {
            let cart = new Cart({
                userId: req.body.userId,
                products: [
                    {
                        id: req.body.id,
                        quantity: req.body.quantity
                    }
                ]
            });
            const result = await cart.save();
            res.status(201).send(result);
        }
    } catch (error) {
        res.send(error);
    }
})

router.get('/cart-product/:userId', jwtUtil.verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.params.userId
        })
        if (cart) {
            let products = [];
            for (let product of cart.products) {
                console.log("product Id: ", product.id);
                await Product.findOne({ id: product.id }).then(p => {
                    console.log("Product: ", p)
                    if (p) {
                        products.push({ id: product.id, title: p.title, imageUrl: p.imgsrc, price: p.price, quantity: product.quantity });
                    }
                });
            }
            res.status(200).send(products)
        } else {
            res.status(404).send({})
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/count/:userId', jwtUtil.verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.params.userId
        })
        if (cart) {
            let count = 0 ;
            for (let product of cart.products) {
                count = count + product.quantity
            }
            res.status(200).send({"count":count})
        } else {
            res.status(404).send({})
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/cart-product/:userId', jwtUtil.verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.params.userId
        })
        if (cart) {
            const data = await Cart.remove({"userId": req.params.userId})
            res.status(200).send(data)
        } else {
            res.status(404).send({})
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/cart-item/:userId', jwtUtil.verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.params.userId
        })
        if (cart) {
            const data = await Cart.updateOne({"userId": req.params.userId},{$pull:{'products': {id: req.body.id}}})
            res.status(200).send(data)
        } else {
            res.status(404).send({})
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;