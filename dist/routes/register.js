var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { UserModel } from "../models/User";
const router = express.Router();
router.get("/", function (req, res) {
    res.status(200).send("Welcome to register page");
});
router.post("/", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const email = req.body.email.toLowerCase();
        const password = req.body.password;
        if (username.length < 5) {
            res.status(400).send({
                message: "The username is too short"
            });
        }
        const existingUser = yield UserModel.findOne({ username: username });
        if (existingUser) {
            res.status(400).send({
                message: "The user with username " + existingUser.username + " is already in use"
            });
        }
        UserModel.create({
            username: username,
            email: email,
            password: password
        }, function (err, newUser) {
            if (err) {
                res.status(400).json({
                    message: "Could not create new user"
                });
            }
            res.status(200).send({
                user: newUser
            });
        });
    });
});
export const registerRoute = router;