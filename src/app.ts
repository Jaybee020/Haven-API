import express from "express"
import { json,urlencoded } from "body-parser"
import cors from "cors"
import mongoose  from "mongoose"
import morgan from "morgan"
import * as dotenv from"dotenv"
import {registerRoute} from "./routes/register"
import {loginRoute} from "./routes/login"
import { chatrouter } from "./routes/chat"
import {createServer} from "http"
import { Server, Socket } from "socket.io"
import { conversationDoc, ConversationModel } from "./models/Conversation"
import { MessageDoc, MessageModel, } from "./models/Message"
import { UserRoute } from "./routes/User"
import  cookieParser from  "cookie-parser"
import { logoutRoute } from "./routes/logout"
UserRoute



dotenv.config()
if(! process.env.PORT){
    process.exit(1)
}






const uri = String(process.env.MONGODB_URI)
mongoose.connect(uri,{})
                .then(()=>{console.log('Connected to the database')})
                .catch((err)=>{console.error("Couldn'to connect to database")})

//running the express app and add to middle ware
const app=express()
app.use(cors())
app.use(json())
app.use(cookieParser())
app.use(morgan('dev'))



const httpServer=createServer(app)
const io=new Server(httpServer)
const PORT:number=parseInt(process.env.PORT as string)
const ObjectId=mongoose.Schema.Types.ObjectId

//routing methods
app.use("/register",registerRoute)
app.use("/login",loginRoute)
app.use("/logout",logoutRoute)
app.use("/chat",chatrouter)
app.use("/user",UserRoute)

app.get("/",(req,res)=>{
    res.status(200).send('Welcome to landing page')
})


io.on("connection",async function (socket:Socket) {
    console.log("connected to websocket")    
    socket.on("connection",(data:any)=>{
        console.log("Connected to websockets succesfully")
    })
    socket.on("join_message",async(data:any)=>{
        const conversation=await ConversationModel.get_or_new(new ObjectId(data.me),new ObjectId(data.other_user))//events needs to emit that type of event
        socket.join(conversation._id.toString())

    })
    socket.on("send_message",async(data:any)=>{
        const conversation=await ConversationModel.get_or_new(new ObjectId(data.me),new ObjectId(data.other_user))
        MessageModel.create({
            conversation:conversation._id,
            sender:data.me,
            receiver:data.other_user,
            content:data.message,
        }),function(err:Error,message:MessageDoc){
                if(err){
                    socket.emit("send_message",{
                        status:"error",
                        message:"Unable to create message "
                    })
                }
                conversation.updateOne({
                    last_contact:message.timestamp,
                    last_message:message.content
                },function(err:Error,conversation:conversationDoc){
                    if(err){
                        socket.emit("send_message",{
                            status:"error",
                            message:"Unable to create message "
                        })
                    }
                    io.to(String(conversation._id)).emit("received_message",data)
                })
        }
    })
    
})

httpServer.listen(PORT||8000,(()=>{
    console.log("Listening here on "+PORT)
}))