import { Schema, model, Types } from "mongoose";
const MessageSchema = new Schema({
    conversation: {
        type: Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiver: {
        type: Types.ObjectId,
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
const MessageModel = model("Message", MessageSchema);
export { MessageModel };
