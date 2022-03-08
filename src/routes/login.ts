import express, { Router,Request,Response } from "express";
import { UserModel,UserDocument} from "../models/User";

const router:Router=express.Router()

router.post("/",function(req:Request,res:Response){
    const username:string=req.body.username
    const password:string=req.body.password

    UserModel.findOne({username:username},function(err:Error,user:UserDocument|null){
        if(!user){
            res.status(401).json({
                message:"Auth failed,could not find username"
            })
        }else{
            user.checkPassword(password,(err:Error,ismatch:Boolean)=>{
                if(!ismatch){
                    res.status(401).json({
                        message:"Username and password do not match"
                    })
                }
                user.generatetoken((err:Error,user:UserDocument)=>{
                    res.cookie("x_auth",user.token)
                        .status(201)
                        .send({
                            message:"Successful Login",
                            user:user
                        })
                })
            })
        }
    })
})

export const loginRoute=router