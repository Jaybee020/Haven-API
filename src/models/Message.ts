import {Schema,model,Document,Model,ObjectId,Types} from "mongoose"

interface Message{
    conversation:ObjectId,
    sender:ObjectId,
    receiver:ObjectId,
    timestamp:Date,
    content:string
}

interface MessageDoc extends Message,Document{
}


const MessageSchema=new Schema<MessageDoc>({
    conversation:{
        type:Types.ObjectId,
        ref:"Conversation",
        required:true
    },
    sender:{
        type:Types.ObjectId,
        required:true,
        ref:"User"
    },
    receiver:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    },
    content:{
        type:String
    }
})

const MessageModel=model<MessageDoc>("Message",MessageSchema)

export {MessageModel,MessageDoc}