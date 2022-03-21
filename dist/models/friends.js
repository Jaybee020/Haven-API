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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsModel = void 0;
const mongoose_1 = require("mongoose");
const FriendSchema = new mongoose_1.Schema({
    requester: {
        type: mongoose_1.Types.ObjectId,
        ref: "User"
    },
    recipient: {
        type: mongoose_1.Types.ObjectId,
        ref: "User"
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: false
    },
    date_accepted: {
        type: Date,
        required: false
    }
});
FriendSchema.static("getRequest", function (user1, user2) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user1 == user2) {
            return null;
        }
        const query1 = { requester: user1, recipient: user2, status: false };
        const query2 = { requester: user2, recipient: user1, status: false };
        var friendDoc = this.findOne({ $or: [query1, query2] });
        return friendDoc;
    });
});
FriendSchema.static("isFriends", function (user1, user2) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user1 == user2) {
            return null;
        }
        const query1 = { requester: user1, recipient: user2, status: true };
        const query2 = { requester: user2, recipient: user1, status: true };
        var friendDoc = this.findOne({ $or: [query1, query2] });
        return friendDoc;
    });
});
FriendSchema.static("getFriendRequest", function (user1) {
    return __awaiter(this, void 0, void 0, function* () {
        const query1 = { requester: user1, status: false };
        const query2 = { recipient: user1, status: false };
        return this.find({ $or: [query1, query2] }).sort("-date_created");
    });
});
FriendSchema.static("getFriends", function (user1) {
    return __awaiter(this, void 0, void 0, function* () {
        const query1 = { requester: user1, status: true };
        const query2 = { recipient: user1, status: true };
        return this.find({ $or: [query1, query2] }).sort("-date_created");
    });
});
exports.FriendsModel = (0, mongoose_1.model)("Friends", FriendSchema);
