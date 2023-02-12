const jwt = require("jsonwebtoken");

const secret = "secretkey";

module.exports.createToken = function (jwtClaims) {
    return jwt.sign({ jwtClaims }, secret, { expiresIn: "24h" })
}

module.exports.verifyToken = function (req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined' && bearerHeader.startsWith("Bearer ")) {
        const bearer = bearerHeader.split(" ");
        if (bearer.length != 2) {
            res.status(401).send({
                result: 'Invalid token'
            })
        } else {
            jwt.verify(bearer[1], secret, (err, authData) => {
                if (err) {
                    res.status(401).send({ result: "Invalid Token" })
                } else {
                    next();
                }
            })
        }
    } else {
        res.status(401).send({
            result: 'Invalid token'
        })
    }
}