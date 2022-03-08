import express, { Router,Request,Response, RequestHandler } from "express";
import { UserModel,UserDocument} from "../models/User";
import { authenticatetoken,Req } from "../middleware/authenticate";
import { ConversationModel } from "../models/Conversation";
import { MessageModel } from "../models/Message";

const router:Router=express.Router()


router.get("/:recipient",authenticatetoken,async function(req:Req,res:Response){
    const recipient_username=req.params.recipient
    const recipient=await UserModel.findOne({username:recipient_username})
    const initiator=req.user
    if(!recipient){
        res.status(400).send({
            "message":"The user you tried to chat with doesnt exist"
        })
    }else{
        const conversation=ConversationModel.get_or_new(initiator?._id,recipient?._id)
        const messages=MessageModel.findOne({conversation:conversation._id})
        const conversations=ConversationModel.get_conversations(initiator?._id)
        res.status(200).send({
            messages:messages
        })

    }
    

})


export const chatrouter= router