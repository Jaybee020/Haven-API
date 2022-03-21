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
exports.UserRoute = exports.getUserbyUsername = void 0;
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../middleware/authenticate");
const User_1 = require("../models/User");
const friends_1 = require("../models/friends");
const router = express_1.default.Router();
function getUserbyUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.UserModel.findOne({
            username: username
        });
        if (user) {
            return user;
        }
        else {
            return null;
        }
    });
}
exports.getUserbyUsername = getUserbyUsername;
//check if request user is authenticated
router.get("/auth", authenticate_1.authenticatetoken, (req, res) => {
    var _a, _b;
    res.status(200).json({
        userData: {
            username: (_a = req.user) === null || _a === void 0 ? void 0 : _a.username,
            email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
        },
    });
});
router.get("/allUsers", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield User_1.UserModel.find();
    const mappedUsers = allUsers.map((user) => {
        return {
            username: user.username,
            email: user.email,
            date_created: user.date_created
        };
    });
    res.status(200).send({
        allusers: mappedUsers
    });
}));
router.get("/:username", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    const userdata = yield getUserbyUsername(username);
    if (!userdata) {
        res.status(400).send({
            message: "This username was not found"
        });
    }
    else {
        res.status(200).send({
            username: userdata.username,
            email: userdata.email,
            date_joined: userdata.date_created
        });
    }
}));
//checks if user is in friend request list and is not in friends list
router.post("/sendRequest", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqUser = req.user;
    const otherUser = yield getUserbyUsername(req.body.username);
    if (reqUser && otherUser) {
        if (reqUser._id == otherUser._id) {
            res.send({ message: "You can't send a friend request to yourself " });
        }
        else {
            const friendRequest = yield friends_1.FriendsModel.getRequest(reqUser._id, otherUser._id);
            if (friendRequest) {
                if (String(reqUser._id) == String(friendRequest.requester)) {
                    res.status(200).send({
                        message: "You have already sent a request to this user "
                    });
                }
                else if (String(reqUser._id) == String(friendRequest._id)) {
                    res.status(200).send({
                        message: "This user has sent you a friend request"
                    });
                }
            }
            else {
                const newFriendRequest = yield friends_1.FriendsModel.create({
                    requester: reqUser._id,
                    recipient: otherUser._id,
                });
                res.status(200).send({
                    message: "Your friend request has been created"
                });
            }
        }
    }
    else {
        res.status(400).send({
            message: "Could not send request"
        });
    }
}));
router.get("/friendRequest/:username", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    const foundUser = yield getUserbyUsername(username);
    if (foundUser) {
        const friendRequests = yield friends_1.FriendsModel.getFriendRequest(foundUser._id);
        if (friendRequests) {
            const sentRequest = friendRequests.filter((friendRequest) => String(friendRequest.requester) == String(foundUser._id));
            const receivedRequest = friendRequests.filter((friendRequest) => String(friendRequest.recipient) == String(foundUser._id));
            res.status(200).send({
                sent: sentRequest,
                received: receivedRequest
            });
        }
        else {
            res.status(200).send({
                message: "Could not find Friend Request"
            });
        }
    }
    else {
        res.status(400).send({
            message: "Could not find username inputed"
        });
    }
}));
router.put("/acceptRequest", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqUser = req.user;
    const username = req.body.username;
    const foundUser = yield getUserbyUsername(username);
    if (foundUser && reqUser) {
        const friendRequest = yield friends_1.FriendsModel.getRequest(reqUser._id, foundUser._id);
        console.log(friendRequest);
        if (friendRequest) {
            yield friendRequest.updateOne({ $set: { status: true } });
            res.status(200).send({
                message: "Your friend Request has been updated"
            });
        }
        else {
            res.status(200).send({
                message: "Could not find Friend Request"
            });
        }
    }
    else {
        res.status(400).send({
            message: "Could not find username inputed"
        });
    }
}));
router.delete("/friend/:username", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    const foundUser = yield getUserbyUsername(username);
    if (foundUser && req.user) {
        const isFriends = yield friends_1.FriendsModel.isFriends(req.user._id, foundUser._id);
        if (isFriends) {
            yield isFriends.delete();
            res.status(200).send({
                message: "Successfully removed" + username + "from your friends"
            });
        }
        else {
            res.status(400).send({
                message: "Could not find friendship between 2 users "
            });
        }
    }
    else {
        res.status(400).send({
            message: "Could not find username inputed"
        });
    }
}));
router.get("/friends/:username", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    const foundUser = yield getUserbyUsername(username);
    if (foundUser) {
        const frienddocs = yield friends_1.FriendsModel.getFriends(foundUser._id);
        if (frienddocs) {
            const friends = frienddocs.map((frienddoc) => {
                if (String(frienddoc.requester) == String(foundUser._id)) {
                    return frienddoc.recipient;
                }
                else if (String(frienddoc.recipient) == String(foundUser._id)) {
                    return frienddoc.requester;
                }
            });
            res.status(200).send({
                friends: friends
            });
        }
        else {
            res.status(400).send({
                message: "Could not find friends"
            });
        }
    }
    else {
        res.status(400).send({
            message: "Could not find username inputed"
        });
    }
}));
exports.UserRoute = router;
