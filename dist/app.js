"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv = __importStar(require("dotenv"));
const register_1 = require("./routes/register");
const login_1 = require("./routes/login");
const chat_1 = require("./routes/chat");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const Conversation_1 = require("./models/Conversation");
const Message_1 = require("./models/Message");
const User_1 = require("./routes/User");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logout_1 = require("./routes/logout");
User_1.UserRoute;
dotenv.config();
if (!process.env.PORT) {
    process.exit(1);
}
const uri = String(process.env.MONGODB_URI);
mongoose_1.default.connect(uri, {})
    .then(() => { console.log('Connected to the database'); })
    .catch((err) => { console.error("Couldn'to connect to database"); });
//running the express app and add to middle ware
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
const PORT = parseInt(process.env.PORT);
const ObjectId = mongoose_1.default.Schema.Types.ObjectId;
//routing methods
app.use("/register", register_1.registerRoute);
app.use("/login", login_1.loginRoute);
app.use("/logout", logout_1.logoutRoute);
app.use("/chat", chat_1.chatrouter);
app.use("/user", User_1.UserRoute);
app.get("/", (req, res) => {
    res.status(200).send('Welcome to landing page');
});
io.on("connection", function (socket) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("connected to websocket");
        socket.on("connection", (data) => {
            console.log("Connected to websockets succesfully");
        });
        socket.on("join_message", (data) => __awaiter(this, void 0, void 0, function* () {
            const conversation = yield Conversation_1.ConversationModel.get_or_new(new ObjectId(data.me), new ObjectId(data.other_user)); //events needs to emit that type of event
            socket.join(conversation._id.toString());
        }));
        socket.on("send_message", (data) => __awaiter(this, void 0, void 0, function* () {
            const conversation = yield Conversation_1.ConversationModel.get_or_new(new ObjectId(data.me), new ObjectId(data.other_user));
            Message_1.MessageModel.create({
                conversation: conversation._id,
                sender: data.me,
                receiver: data.other_user,
                content: data.message,
            }), function (err, message) {
                if (err) {
                    socket.emit("send_message", {
                        status: "error",
                        message: "Unable to create message "
                    });
                }
                conversation.updateOne({
                    last_contact: message.timestamp,
                    last_message: message.content
                }, function (err, conversation) {
                    if (err) {
                        socket.emit("send_message", {
                            status: "error",
                            message: "Unable to create message "
                        });
                    }
                    io.to(String(conversation._id)).emit("received_message", data);
                });
            };
        }));
    });
});
httpServer.listen(PORT || 8000, (() => {
    console.log("Listening here on " + PORT);
}));
