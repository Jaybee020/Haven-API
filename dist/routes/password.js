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
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = require("jsonwebtoken");
// import { EMAIL_SENT_FROM,transporter } from "./register";
const router = express_1.default.Router();
router.put("/forgot", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resetemail = req.body.resetemail;
            const user_account = yield User_1.UserModel.findOne({ email: resetemail });
            if (!user_account) {
                res.status(401).json({
                    message: "Could not find account of that email"
                });
            }
            else {
                var passwordResetToken = (0, jsonwebtoken_1.sign)(user_account._id, String(process.env.RESET_PASSWORD_KEY), { expiresIn: "20m" });
                // const msg = {
                //     to: resetemail,
                //     from: EMAIL_SENT_FROM,
                //     subject: "Click link to reset your password",
                //     html: `<h2>Here's your password-reset link!</h2>
                //     <a href="${process.env.CLIENT_URL}/forgotPassword?token=${passwordResetToken}">${process.env.CLIENT_URL}/forgotPassword?token=${passwordResetToken}</a>
                //     <p>For security reasons, this link will expire within 20 mins! </p>`,
                //   };
                user_account.updateOne({ passwordResetToken: passwordResetToken }, (err, updatedUser) => {
                    if (err) {
                        res.status(401).json({
                            message: "Reset password link error"
                        });
                    }
                    else {
                        // transporter.sendMail(msg,function(err, info){
                        //     if (err) {
                        //         message:"Could not send mail now"
                        //     } else {
                        //         res.status(200).json({
                        //             message:"Reset Password link sent to mail"
                        //         });
                        //     }
                        //     });
                    }
                });
            }
        }
        catch (error) {
            res.status(401).json({
                message: "An unexpected error occured"
            });
        }
    });
});
router.put("/reset", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { resetLinkToken, newPassword } = req.body;
        try {
            const decoded = (0, jsonwebtoken_1.verify)(resetLinkToken, String(process.env.RESET_PASSWORD_KEY));
            let found_user = yield User_1.UserModel.findOne({ passwordResetToken: resetLinkToken });
            if (found_user) {
                found_user.update({
                    password: newPassword,
                    $unset: { passwordResetToken: "" }
                });
            }
        }
        catch (error) {
            res.status(401).json({
                message: "Incorrect or Expired Reset Password Link, please resend forgot password email from Login page."
            });
        }
    });
});
