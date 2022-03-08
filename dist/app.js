var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { registerRoute } from "./routes/register";
import { loginRoute } from "./routes/login";
import { chatrouter } from "./routes/chat";
import { createServer } from "http";
import { Server } from "socket.io";
import { ConversationModel } from "./models/Conversation";
import { MessageModel, } from "./models/Message";
dotenv.config();
if (!process.env.PORT) {
    process.exit(1);
}
mongoose.connect("mongodb://localhost:27017/Shoot-API")
    .then(() => { console.log('Connected to the database'); })
    .catch((err) => { console.error("Couldn'to connect to database"); });
//running the express app and add to middle ware
const app = express();
app.use(cors());
app.use(json());
app.use(morgan('dev'));
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = parseInt(process.env.PORT);
const ObjectId = mongoose.Schema.Types.ObjectId;
//routing methods
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/chat", chatrouter);
app.get("/", (req, res) => {
    res.status(200).send('Welcome');
});
io.on("connection", function (socket) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("connected to websocket");
        socket.on("connection", (data) => {
            console.log("Connected to websockets succesfully");
        });
        socket.on("join_message", (data) => __awaiter(this, void 0, void 0, function* () {
            const conversation = yield ConversationModel.get_or_new(new ObjectId(data.me), new ObjectId(data.other_user)); //events needs to emit that type of event
            socket.join(conversation._id.toString());
        }));
        socket.on("send_message", (data) => __awaiter(this, void 0, void 0, function* () {
            const conversation = yield ConversationModel.get_or_new(new ObjectId(data.me), new ObjectId(data.other_user));
            MessageModel.create({
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
httpServer.listen(PORT | 8000, (() => {
    console.log("Listening here on " + PORT);
}));
