var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Schema, model, Types } from "mongoose";
const ConversationSchema = new Schema({
    initiator: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    lastContact: {
        type: Date,
        required: false
    },
    lastMessage: {
        type: Types.ObjectId,
        required: false,
        ref: "Message"
    },
    private: {
        type: Boolean,
        default: true
    }
});
ConversationSchema.static("get_or_new", function (user1, user2) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user1 == user2) {
            return null;
        }
        const query1 = { initiator: user1, recipient: user2 };
        const query2 = { initiator: user2, recipient: user1 };
        var conversation = yield this.findOne({ $or: [query1, query2] });
        if (!conversation) {
            conversation = this.create({
                initiator: user1,
                recipient: user2,
            });
        }
        return conversation;
    });
});
ConversationSchema.static("get_conversations", function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        const query1 = { initiator: user };
        const query2 = { recipient: user };
        return this.find({ $or: [query1, query2] }).populate(["initiator", "recipient"]).sort("-lastContact");
    });
});
const ConversationModel = model("Conversation", ConversationSchema);
export { ConversationModel, ConversationSchema, };
