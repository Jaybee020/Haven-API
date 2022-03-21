import {Schema,model,Document,Model,ObjectId,Types} from "mongoose"
//Add invite status 

interface conversation{
    initiator:ObjectId,
    recipient:ObjectId,
    lastContact:Date,
    lastMessage:ObjectId
    private:boolean
}

interface conversationDoc extends conversation,Document{}  
interface ConversationModel extends Model<conversationDoc>{
    get_or_new:(user1:ObjectId,user2:ObjectId)=>conversationDoc
    get_conversations:(user:ObjectId)=>conversationDoc[]
}

const ConversationSchema=new Schema<conversationDoc>({
    initiator:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    recipient:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    lastContact:{
        type:Date,
        required:false
    },
    lastMessage:{
        type:Types.ObjectId,
        required:false,
        ref:"Message"
    },
    private:{
        type:Boolean,
        default:true
    }
})


ConversationSchema.static("get_or_new",async function (user1:ObjectId,user2:ObjectId):Promise<conversationDoc|null> {
    if(user1==user2){
        return null
    }
    const query1={initiator:user1,recipient:user2}
    const query2={initiator:user2,recipient:user1}
    var conversation:null|conversationDoc=await this.findOne({$or:[query1,query2]})
    if(!conversation){
        conversation=await this.create({
            initiator:user1,
            recipient:user2,
        })
    }
    return conversation
    
})

ConversationSchema.static("get_conversations",async function (user:ObjectId):Promise<conversationDoc> {
    const query1={initiator:user}
    const query2={recipient:user}
    return this.find({$or:[query1,query2]}).populate(["initiator","recipient"]).sort("-lastContact")
})

const ConversationModel=model<conversationDoc,ConversationModel>("Conversation",ConversationSchema)

export {ConversationModel,ConversationSchema,conversationDoc,}