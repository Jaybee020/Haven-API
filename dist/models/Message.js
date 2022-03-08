"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    conversation: {
        type: mongoose_1.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {
        type: mongoose_1.Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiver: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String
    }
});
const MessageModel = (0, mongoose_1.model)("Message", MessageSchema);
exports.MessageModel = MessageModel;
