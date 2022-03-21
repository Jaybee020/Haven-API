import {Schema,model,Document,Model,ObjectId,Types} from "mongoose"
export interface Friends extends Document{
    requester:ObjectId,
    recipient:ObjectId,
    date_created:Date,
    date_accepted:Date,
    status:Boolean
}

export interface FriendModel extends Model<Friends>{
    getRequest:(user1:ObjectId,user2:ObjectId)=>Promise<Friends|null>
    isFriends:(user1:ObjectId,user2:ObjectId)=>Promise<Friends|null>
    getFriends:(user:ObjectId)=>Promise<Friends[]|null>
    getFriendRequest:(user:ObjectId)=>Promise<Friends[]|null>
}


const FriendSchema=new Schema<Friends>({
    requester:{
        type:Types.ObjectId,
        ref:"User"
    },
    recipient:{
        type:Types.ObjectId,
        ref:"User"
    },
    date_created:{
        type:Date,
        default:Date.now
    },
    status:{
        type:Boolean,
        default:false
    },
    date_accepted:{
        type:Date,
        required:false
    }
})

FriendSchema.static("getRequest",async function(user1:ObjectId,user2:ObjectId):Promise<Friends|null>{
    if(user1==user2){
        return null
    }
    const query1={requester:user1,recipient:user2,status:false}
    const query2={requester:user2,recipient:user1,status:false}
    var friendDoc:Friends|null= this.findOne({$or:[query1,query2]})
    return friendDoc
})

FriendSchema.static("isFriends",async function(user1:ObjectId,user2:ObjectId):Promise<Friends|null>{
    if(user1==user2){
        return null
    }
    const query1={requester:user1,recipient:user2,status:true}
    const query2={requester:user2,recipient:user1,status:true}
    var friendDoc:Friends|null= this.findOne({$or:[query1,query2]})
    return friendDoc
})

FriendSchema.static("getFriendRequest",async function(user1:ObjectId):Promise<Friends[]|null>{
    const query1={requester:user1,status:false}
    const query2={recipient:user1,status:false}
    return this.find({$or:[query1,query2]}).sort("-date_created")
})

FriendSchema.static("getFriends",async function(user1:ObjectId):Promise<Friends[]|null>{
    const query1={requester:user1,status:true}
    const query2={recipient:user1,status:true}
    return this.find({$or:[query1,query2]}).sort("-date_created")
})

export const FriendsModel=model<Friends,FriendModel>("Friends",FriendSchema)
