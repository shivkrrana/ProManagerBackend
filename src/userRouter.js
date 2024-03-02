const express = require("express");
const router = new express.Router();
const jwtUtil = require('./jwtUtil');
const User = require("./userModel");
const pass = require("./password");

router.use(express.json());

router.get("/", (req, res) => {
    res.send("hello")
})

// <----------------- Register ----------------->
router.post("/register", async (req, res) => {
    try {
        const userExist = await User.findOne({
            email: req.body.email
        })
        if (userExist) {
            return res.status(403).send({ message: 'User Already Exists' });
        } else {
            const hashedPassword = await pass.hashPassword(req.body.password);
            req.body.password = hashedPassword;
            const document = new User(req.body);
            const result = await document.save();
            res.status(201).send({ message: 'Registration Success' });
        }
    } catch (error) {
        res.status(400).send(error);
        console.log(error)
    }
});

// <----------------- Login ----------------->
router.post("/login", async (req, res) => {
    try {
        const userExist = await User.findOne({
            email: req.body.email
        })
        if (userExist) {
            const verifyPass = await pass.verifyPassword(req.body.password, userExist.password);
            if (verifyPass) {
                const jwtClaims = {
                    name: userExist.name,
                    email: userExist.email
                }
                let token = jwtUtil.createToken(jwtClaims);
                res.status(200).send({ messge: 'Login Success', token });
            } else {
                res.status(401).send({ message: 'Invalid Credentials' });
            }
        }
        else res.status(401).send({ message: 'Invalid Credentials' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// <----------------- Protected Routing ----------------->
router.get("/protected", jwtUtil.verifyToken, async (req, res) => {
    res.status(200).send({ message: 'Authorized User' });
});

// <----------------- Update ----------------->
router.put("/update", jwtUtil.verifyToken, async (req, res) => {
    try {
        const userExist = await User.findOne({
            email: req.email
        })
        if (userExist) {
            if (req.body?.oldpassword !== '' && req.body?.newpassword !== '') {
                const verifiedPass = await pass.verifyPassword(req.body.oldpassword, userExist.password);
                if (verifiedPass) {
                    const hashedPassword = await pass.hashPassword(req.body.newpassword);
                    const obj = {
                        name: req.body.name,
                        password: hashedPassword
                    }
                    if (req.body?.name !== '' && req.body?.name !== userExist.name) {
                        const result = await User.findOneAndUpdate({ email: req.email }, { $set: obj }, {new : true});
                        if (result)
                            res.status(200).send({ message: 'Name and Password Updated', name : result.name });
                        else
                            res.status(400).send({ message: 'Network Error' })
                    } else {
                        const result = await User.findOneAndUpdate({ email: req.email }, { $set: { password: hashedPassword } });
                        if (result)
                            res.status(200).send({ message: 'Password Updated' });
                        else
                            res.status(400).send({ message: 'Network Error' })
                    }
                } else {
                    res.status(400).send({ message: 'Wrong Old Password' });
                }
            }
            else if (req.body?.name !== '' && req.body?.name !== userExist.name) {
                const result = await User.findOneAndUpdate({ email: req.email }, { $set: { name: req.body.name } }, {new : true});
                if (result)
                    res.status(200).send({ message: 'Name Updated' , name : result.name});
                else
                    res.status(400).send({ message: 'Network Error' })
            }
            else if (req.body?.name === userExist.name) {
                    res.status(400).send({ message: 'Type New Name'});
            }
            else
                res.status(400).send({ message: `All fields can't be empty` })
        }
        else
            res.status(400).send({ message: 'Network Error' })
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;