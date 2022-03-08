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
exports.chatrouter = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const authenticate_1 = require("../middleware/authenticate");
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const router = express_1.default.Router();
router.get("/:recipient", authenticate_1.authenticatetoken, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const recipient_username = req.params.recipient;
        const recipient = yield User_1.UserModel.findOne({ username: recipient_username });
        const initiator = req.user;
        if (!recipient) {
            res.status(400).send({
                "message": "The user you tried to chat with doesnt exist"
            });
        }
        else {
            const conversation = Conversation_1.ConversationModel.get_or_new(initiator === null || initiator === void 0 ? void 0 : initiator._id, recipient === null || recipient === void 0 ? void 0 : recipient._id);
            const messages = Message_1.MessageModel.findOne({ conversation: conversation._id });
            const conversations = Conversation_1.ConversationModel.get_conversations(initiator === null || initiator === void 0 ? void 0 : initiator._id);
            res.status(200).send({
                messages: messages
            });
        }
    });
});
exports.chatrouter = router;
