import express from "express";
import { UserModel } from "../models/User";
const router = express.Router();
router.post("/", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    UserModel.findOne({ username: username }, function (err, user) {
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
export const loginRoute = router;
