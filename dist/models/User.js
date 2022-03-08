import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
const UserSchema = new Schema({
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
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, (err, hash) => {
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
    bcrypt.compare(password, user.password, function (err, isMatch) {
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
    var token = sign(user._id.toString(), String(process.env.LOGIN_SECRET));
    UserModel.findOneAndUpdate({ _id: user._id }, { $set: { token: token } }, function (err, updatedUser) {
        if (err) {
            console.log(err);
        }
        console.log(user);
        cb(null, user);
    });
};
UserSchema.statics.findByToken = function (token, cb) {
    var user = this;
    const decode = verify(token, String(process.env.LOGIN_SECRET));
    user.findOne({ token: decode }, function (err, user) {
        if (err) {
            console.error(err);
        }
        cb(null, user);
    });
};
UserSchema.methods.deletetoken = function (cb) {
    var user = this;
    user.updateOne({ $unset: { token: "" } }, function (err, user) {
        cb(null, user);
    });
};
export const UserModel = model('User', UserSchema);
