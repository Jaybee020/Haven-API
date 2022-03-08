"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRoute = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post("/", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User_1.UserModel.findOne({ username: username }, function (err, user) {
        if (!user) {
            res.status(401).json({
                message: "Auth failed,could not find username"
            });
        }
        else {
            user.checkPassword(password, (err, ismatch) => {
                if (!ismatch) {
                    res.status(401).json({
                        message: "Username and password do not match"
                    });
                }
                user.generatetoken((err, user) => {
                    res.cookie("x_auth", user.token)
                        .status(201)
                        .send({
                        message: "Successful Login",
                        user: user
                    });
                });
            });
        }
    });
});
exports.loginRoute = router;
