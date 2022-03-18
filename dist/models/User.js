"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
});
//hash password before saving it to db
UserSchema.pre("save", function (next) {
    const user = this;
    if (user.isModified("password")) {
        bcrypt_1.default.genSalt(10, (err, salt) => {
            if (err) {
                return next(err);
            }
            bcrypt_1.default.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    }
});
//compare passwords
UserSchema.methods.checkPassword = function (password, cb) {
    var user = this;
    bcrypt_1.default.compare(password, user.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        console.log(isMatch);
        cb(null, isMatch);
    });
};
UserSchema.methods.generatetoken = function (cb) {
    const user = this;
    console.log(process.env.LOGIN_SECRET);
    var token = (0, jsonwebtoken_1.sign)(user._id.toString(), String(process.env.LOGIN_SECRET));
    exports.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { token: token } }, function (err, updatedUser) {
        if (err) {
            console.log(err);
        }
        console.log(user);
        cb(null, user);
    });
};
UserSchema.statics.findByToken = function (token, cb) {
    var user = this;
    try {
        const decode = (0, jsonwebtoken_1.verify)(token, String(process.env.LOGIN_SECRET));
        user.findOne({ _id: decode, token: token }, function (err, user) {
            if (err) {
                console.error(err);
            }
            cb(null, user);
        });
    }
    catch (err) {
        cb(err, null);
    }
};
UserSchema.methods.deletetoken = function (cb) {
    var user = this;
    user.updateOne({ $unset: { token: "" } }, function (err, user) {
        cb(null, user);
    });
};
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
