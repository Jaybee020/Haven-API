"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatetoken = void 0;
const User_1 = require("../models/User");
const authenticatetoken = function (req, res, next) {
    const token = req.cookies.x_auth;
    User_1.UserModel.findByToken(token, (err, user) => {
        if (err) {
            console.error(err);
        }
        if (!user) {
            res.status(400).send({ auth: false, message: "Wrong cookie!" });
        }
        else {
            req.token = token;
            req.user = user;
            next();
        }
    });
};
exports.authenticatetoken = authenticatetoken;
