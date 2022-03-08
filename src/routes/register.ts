import express, { Router,Request,Response } from "express";
import { UserModel,UserDocument} from "../models/User";

const router:Router=express.Router()

router.get("/",function(req:Request,res:Response){
    res.status(200).send("Welcome to register page")
})

router.post("/",async function(req:Request,res:Response){
    const username:string=req.body.username
    const email:String=req.body.email.toLowerCase()
    const password:string=req.body.password
    if(username.length<5){
        res.status(400).send({
            message:"The username is too short"
        })
    }
    const existingUser:UserDocument|null=await UserModel.findOne({username:username})
    if(existingUser){
        res.status(400).send({
            message:"The user with username "+existingUser.username +" is already in use"
        })
    }
    UserModel.create({
        username:username,
        email:email,
        password:password
    },function(err,newUser:UserDocument){
        if(err){
            res.status(400).json({
                message:"Could not create new user"
            })
        }
        res.status(200).send({
            user:newUser
        })
    })
})

export const registerRoute=router