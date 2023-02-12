const express = require("express");
const router = new express.Router();
const jwtUtil = require('./jwtUtil');
const User = require("./userModel");

router.use(express.json());

router.get("/", (req, res) => {
    res.send("hello")
})

router.post("/signup", async (req, res) => {
    try {
        const userExist = await User.findOne({
            email: req.body.email
        })
        if (userExist) {
            return res.status(422).json({ error: "Email already Exist" })
        } else {
            const document = new User(req.body);
            const result = await document.save();
            const jwtClaims = {
                sub: req.body.name,
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
            }
            let token = jwtUtil.createToken(jwtClaims);
            res.status(201).send({ id: result._id, name: result.name, token });
        }
    } catch (error) {
        res.status(400).send(error);
        console.log(error)
    }
});

router.post("/signin", async (req, res) => {
    try {
        const userExist = await User.findOne({
            email: req.body.email
        })

        if (userExist) {
            if (req.body.password === userExist.password) {
                const user = {
                    email: req.body.email
                }
                res.status(200).send({ name: userExist.name, id: userExist._id, token: jwtUtil.createToken(user) });
            }else{
                res.status(302).send({error:"password not matched"})
            }
        }
        else res.status(400).send(error);
    } catch (error) {
        res.status(400).send(error);
    }
});


module.exports = router;