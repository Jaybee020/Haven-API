"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoute = exports.EMAIL_SENT_FROM = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = require("jsonwebtoken");
const router = express_1.default.Router();
exports.EMAIL_SENT_FROM = "olayinkaganiyu1@gmail.com";
// export let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.APP_EMAIL,
//       pass: process.env.APP_EMAIL_PASS,
//     },
//   });
router.get("/", function (req, res) {
    res.status(200).send("Welcome to register page");
});
router.post("/", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.body.username;
        const email = req.body.email.toLowerCase();
        const password = req.body.password;
        if (username.length < 4) {
            res.status(400).send({
                message: "The username is too short"
            });
        }
        const existingUser = yield User_1.UserModel.findOne({ $or: [{ email: email }, { username: username }] });
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.username) == username) {
            res.status(400).send({
                message: "This username is already in use"
            });
        }
        else if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.email) == email) {
            res.status(400).send({
                message: "This email is already in use"
            });
        }
        else {
            User_1.UserModel.create({
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
                    message: "Your account was succesfully created"
                });
            });
        }
        // var activationToken = sign(
        //     { email, password, username },
        //     String(process.env.ACTIVATION_SECRET),
        //     { expiresIn: "20m" }
        //   );
        // let mailOptions={
        //     from:EMAIL_SENT_FROM,
        //     to: email,
        //     subject: "Click link to activate account",
        //       html: `<h2>Here's your activation link!</h2>
        //       <a href="${process.env.CLIENT_URL}/login?activate=${activationToken}">${process.env.CLIENT_URL}/login?activate=${activationToken}</a>
        //       <p>Thank you for creating an account with <your app name> 😄 For security reasons, this link will expire within 20 mins! </p>`,
        //     };
        // transporter.sendMail(mailOptions,function(err, info){
        //     if (err) {
        //         res.json(err);
        //     } else {
        //         res.json(info);
        //     }
        //     });
    });
});
router.post("/activateUser", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var token = req.body.activationToken;
        if (token) {
            try {
                const decoded = (0, jsonwebtoken_1.verify)(token, String(process.env.ACTIVATION_SECRET));
                const { email, password, username } = decoded;
                const existingUser = yield User_1.UserModel.findOne({ $or: [{ email: email }, { username: username }] });
                if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.username) == username) {
                    res.status(400).send({
                        message: "The user with username " + existingUser.username + " is already in use"
                    });
                }
                else if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.email) == email) {
                    res.status(400).send({
                        message: "The user with username " + existingUser.email + " is already in use"
                    });
                }
                else {
                    User_1.UserModel.create({
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
                            message: "Successfully created new account",
                            user: newUser
                        });
                    });
                }
            }
            catch (err) {
                res
                    .status(400)
                    .json({ message: "Incorrect/Expired Link, try signing up again" });
            }
        }
    });
});
exports.registerRoute = router;
