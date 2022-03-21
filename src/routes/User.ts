import express, { Router,Request,Response } from "express";
import { authenticatetoken } from "../middleware/authenticate";
import { Req } from "../middleware/authenticate";
import { UserModel,UserDocument } from "../models/User";
import { Friends,FriendsModel } from "../models/friends";
import {ObjectId} from "mongoose"
const router:Router=express.Router()



export async function getUserbyUsername(username:string):Promise<UserDocument|null>{
    const user=await UserModel.findOne({
        username:username
    })
    if(user){
        return user
    }else{
        return null
    }
}

//check if request user is authenticated
router.get("/auth", authenticatetoken, (req:Req, res:Response) => {
    res.status(200).json({
      userData: {
        username: req.user?.username,
        email: req.user?.email,
      },
    });
  });


router.get("/allUsers",authenticatetoken,async(req:Req,res:Response)=>{
    const allUsers=await UserModel.find()
    const mappedUsers=allUsers.map((user)=>{
        return {
            username:user.username,
            email:user.email,
            date_created:user.date_created
        }
    })
    res.status(200).send({
        allusers:mappedUsers
    })
        
})  

router.get("/:username",authenticatetoken,async(req:Req,res:Response)=>{
    const username=req.params.username
    const userdata=await getUserbyUsername(username)
    if(!userdata){
        res.status(400).send({
            message:"This username was not found"
        })
    }else{
        res.status(200).send({
            username:userdata.username,
            email:userdata.email,
            date_joined:userdata.date_created
        })
    }
})


//checks if user is in friend request list and is not in friends list
router.post("/sendRequest",authenticatetoken,async(req:Req,res:Response)=>{
    const reqUser=req.user
    const otherUser=await getUserbyUsername(req.body.username)
    if(reqUser && otherUser){
        if(reqUser._id==otherUser._id){
            res.send({message:"You can't send a friend request to yourself "})
        }else{
            const friendRequest=await FriendsModel.getRequest(reqUser._id,otherUser._id)
            if(friendRequest){
                if(String(reqUser._id)==String(friendRequest.requester)){
                    res.status(200).send({
                        message:"You have already sent a request to this user "
                    })
                }else if(String(reqUser._id)==String(friendRequest._id)){
                    res.status(200).send({
                        message:"This user has sent you a friend request"
                    })
                }
            }else{
                const newFriendRequest=await FriendsModel.create({
                    requester:reqUser._id,
                    recipient:otherUser._id,
                })
                res.status(200).send({
                    message:"Your friend request has been created"
                })
            }
        }
    }else{
        res.status(400).send({
            message:"Could not send request"
        })
    }
})

router.get("/friendRequest/:username",authenticatetoken,async(req:Req,res:Response)=>{
    const username=req.params.username
    const foundUser=await getUserbyUsername(username)
    if(foundUser){
       const friendRequests= await FriendsModel.getFriendRequest(foundUser._id)
       if(friendRequests){
            const sentRequest=friendRequests.filter((friendRequest)=>String(friendRequest.requester)==String(foundUser._id))
            const receivedRequest=friendRequests.filter((friendRequest)=>String(friendRequest.recipient)==String(foundUser._id))
            res.status(200).send({
                sent:sentRequest,
                received:receivedRequest
            })

       }else{
           res.status(200).send({
               message:"Could not find Friend Request"
           })
       }
    }else{
        res.status(400).send({
            message:"Could not find username inputed"
        })
    }
})


router.put("/acceptRequest",authenticatetoken,async(req:Req,res:Response)=>{
    const reqUser=req.user
    const username=req.body.username
    const foundUser=await getUserbyUsername(username)
    if(foundUser && reqUser){
        const friendRequest=await FriendsModel.getRequest(reqUser._id,foundUser._id)
        console.log(friendRequest)
        if(friendRequest){
            await friendRequest.updateOne({$set:{status:true}}) 
            res.status(200).send({
                message:"Your friend Request has been updated"
            })
        }else{
            res.status(200).send({
                message:"Could not find Friend Request"
            })
        }
    }else{
        res.status(400).send({
            message:"Could not find username inputed"
        })
    }
})

router.delete("/friend/:username",authenticatetoken,async(req:Req,res:Response)=>{
    const username=req.params.username
    const foundUser=await getUserbyUsername(username)
    if(foundUser && req.user){
        const isFriends=await FriendsModel.isFriends(req.user._id,foundUser._id)
        if(isFriends){
            await isFriends.delete()
            res.status(200).send({
                message:"Successfully removed"+username+"from your friends"
            })
        }else{
            res.status(400).send({
                message:"Could not find friendship between 2 users "
            })
        }
    }else{
        res.status(400).send({
            message:"Could not find username inputed"
        })
    }
})


router.get("/friends/:username",authenticatetoken,async(req:Req,res:Response)=>{
    const username=req.params.username
    const foundUser=await getUserbyUsername(username)
    if(foundUser){
        const frienddocs=await FriendsModel.getFriends(foundUser._id)
        if(frienddocs){
            const friends:(ObjectId|undefined)[]=frienddocs.map((frienddoc)=>{
                if(String(frienddoc.requester)==String(foundUser._id)){
                    return frienddoc.recipient
                }else if(String(frienddoc.recipient)==String(foundUser._id)){
                    return frienddoc.requester
                }
            })
            res.status(200).send({
                friends:friends
            })
        }else{
            res.status(400).send({
                message:"Could not find friends"
            })  
        }
    }else{
        res.status(400).send({
            message:"Could not find username inputed"
        })
    }
})




export const UserRoute= router