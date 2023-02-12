const express = require("express");
const jwtUtil = require('./jwtUtil')
const Product = require("./productModel");
const router = new express.Router();
router.use(express.json());

router.get('/product', async (req, res) => {

    try {
        const allProducts = await Product.find({});
        res.status(200).send(allProducts);
    } catch (error) {
        res.status(400).send(error);
    }

})

router.post('/product', async (req, res) => {

    try {
        const productExist = await Product.findOne({
            id: req.body.id
        });
        if(productExist){
            res.status(400).send("Product Exist");
        }else{
            const document = new Product(req.body);
            const result = await document.save();
            res.status(201).send(result);
        }
    } catch (error) {
        res.status(400).send(error);
    }

})

module.exports = router;