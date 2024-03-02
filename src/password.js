const bcrypt = require('bcrypt');

// <----------------- Hash password ----------------->
module.exports.hashPassword = async(password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

// <----------------- Verify password ----------------->
module.exports.verifyPassword = async(plainPassword, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        throw error;
    }
}
